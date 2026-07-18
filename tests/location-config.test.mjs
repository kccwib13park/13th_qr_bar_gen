import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const projectRoot = new URL('../', import.meta.url);
const rangeConfig = JSON.parse(
  await readFile(new URL('data/location-range-config.json', projectRoot), 'utf8')
);
const displayConfig = JSON.parse(
  await readFile(new URL('data/location-display-config.json', projectRoot), 'utf8')
);
const indexHtml = await readFile(new URL('index.html', projectRoot), 'utf8');

function readFallbackRangeConfig() {
  const match = indexHtml.match(
    /const DEFAULT_RANGE_CONFIG = Object\.freeze\((\{[\s\S]*?\})\);\s*let rangeConfig/
  );
  assert.ok(match, 'index.html에서 기본 범위 설정을 찾을 수 있어야 합니다.');
  return vm.runInNewContext(`(${match[1]})`);
}

test('대량 지번 카탈로그가 일반 지번 선택 범위를 제한하지 않는다', () => {
  const catalogZoneKeys = Object.keys(displayConfig.rackProductCatalog);
  const restrictedZoneKeys = Object.keys(rangeConfig.locationInputRules);

  for (const zoneKey of catalogZoneKeys) {
    assert.ok(
      !restrictedZoneKeys.includes(zoneKey),
      `${zoneKey} 제품 카탈로그는 렉/칸 선택 범위와 분리되어야 합니다.`
    );
  }
});

test('일반 선택 범위가 카탈로그 지번과 다른 지번을 모두 포함한다', () => {
  const [firstRack, lastRack] = rangeConfig.rackCellDefaults.rackRange;
  assert.equal(firstRack, 0);
  assert.equal(lastRack, 60);
  assert.ok(rangeConfig.rackCellDefaults.cellOptions.includes(1));
  assert.ok(rangeConfig.rackCellDefaults.cellOptions.includes(101));

  for (const [zoneKey, catalog] of Object.entries(displayConfig.rackProductCatalog)) {
    for (const rack of Object.keys(catalog.products).map(Number)) {
      assert.ok(
        rack >= firstRack && rack <= lastRack,
        `${zoneKey}의 렉 ${rack}이 일반 선택 범위를 벗어났습니다.`
      );
    }
  }
});

test('A존 AL 지번은 B존과 같은 번호 범위에서 존재하는 렉만 제공한다', () => {
  assert.deepEqual(rangeConfig.zoneRules.AL, [1, 2]);
  assert.deepEqual(rangeConfig.locationInputRules['AL-1'].rackOptions, [1, 2, 3, 5]);
  assert.deepEqual(rangeConfig.locationInputRules['AL-2'].rackOptions, [1, 2, 3, 5]);
  assert.match(indexHtml, /A_ZONE: \{ label: 'A존', codes: \[[^\]]*'AL'/);
  assert.match(
    indexHtml,
    /const rackOptions = locationRule\?\.rackOptions \|\| createRange\(rackRange\[0\], rackRange\[1\]\)/
  );
});

test('HTML 폴백 설정이 외부 범위 설정과 동일하다', () => {
  const fallback = readFallbackRangeConfig();
  assert.deepEqual(
    JSON.parse(JSON.stringify(fallback.zoneRules)),
    rangeConfig.zoneRules
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(fallback.rackCellDefaults)),
    rangeConfig.rackCellDefaults
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(fallback.locationInputRules)),
    rangeConfig.locationInputRules
  );
});
