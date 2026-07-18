import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const source = indexHtml.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n    \\}`))?.[0];
  assert.ok(source, `${name} 함수를 찾을 수 있어야 합니다.`);
  return source;
}

const getInventoryZoneGroupSource = extractFunction('getInventoryZoneGroup');
const compareInventoryZoneKeysSource = extractFunction('compareInventoryZoneKeys');
const buildContinuousScanStepsSource = extractFunction('buildContinuousScanSteps');

const { getInventoryZoneGroup, compareInventoryZoneKeys, buildContinuousScanSteps } = new Function(`
  const INVENTORY_ZONE_PRIORITY = ['H1', 'BD', 'BC', 'AD', 'AC', 'OTHER'];
  ${getInventoryZoneGroupSource}
  ${compareInventoryZoneKeysSource}
  ${buildContinuousScanStepsSource}
  return { getInventoryZoneGroup, compareInventoryZoneKeys, buildContinuousScanSteps };
`)();

test('대량 지번과 검색 결과의 존 우선순위는 H1, BD, BC, AD, AC, 나머지 순이다', () => {
  const zoneKeys = ['BA-1', 'AC-2', 'BC-2', 'H-1', 'AD-2', 'BD-2', 'BC-1', 'BD-1'];
  assert.deepEqual(zoneKeys.sort(compareInventoryZoneKeys), [
    'H-1', 'BD-1', 'BD-2', 'BC-1', 'BC-2', 'AD-2', 'AC-2', 'BA-1'
  ]);
  assert.match(indexHtml, /Object\.keys\(displayConfig\.rackProductCatalog\)\.sort\(compareInventoryZoneKeys\)/);
});

test('연속 스캔은 현재 검색 결과 전체를 제품 코드 QR 순서로 사용한다', () => {
  const scanSource = indexHtml.match(/function buildContinuousScanSteps[\s\S]*?function removeDirectHistoryItem/)?.[0] || '';
  assert.match(scanSource, /getFilteredInventoryItems\(rawQuery\)/);
  assert.match(scanSource, /scanStep\.item\.productCode/);
  assert.doesNotMatch(scanSource, /locationCode|적치 QR/);
  assert.match(indexHtml, /id="startScanModeBtn"[^>]*disabled>현재 목록 연속 스캔/);
  assert.match(indexHtml, /startScanModeBtn'\)\.disabled = filteredItems\.length === 0/);
});

test('H1에는 책갈피가 없고 이후 존 앞에는 안내 책갈피가 들어간다', () => {
  const items = [
    { zoneKey: 'H-1', productCode: 'H01' },
    { zoneKey: 'H-1', productCode: 'H02' },
    { zoneKey: 'BD-1', productCode: 'BD01' },
    { zoneKey: 'BD-2', productCode: 'BD02' },
    { zoneKey: 'BC-1', productCode: 'BC01' },
    { zoneKey: 'AD-2', productCode: 'AD01' },
    { zoneKey: 'AC-2', productCode: 'AC01' },
    { zoneKey: 'BA-1', productCode: 'BA01' }
  ];
  const steps = buildContinuousScanSteps(items);

  assert.deepEqual(
    steps.map((step) => step.type === 'bookmark' ? `bookmark:${step.zoneLabel}` : step.item.productCode),
    ['H01', 'H02', 'bookmark:BD', 'BD01', 'BD02', 'bookmark:BC', 'BC01', 'bookmark:AD', 'AD01', 'bookmark:AC', 'AC01', 'bookmark:나머지 존', 'BA01']
  );
  assert.equal(getInventoryZoneGroup('H-1').hasBookmark, false);
  assert.match(indexHtml, /왼쪽으로 스와이프 하여 \$\{scanStep\.zoneLabel\} 계속 스캔/);
});

test('H1 검색 결과는 책갈피 없이 제품 코드만 연속 표시한다', () => {
  const steps = buildContinuousScanSteps([
    { zoneKey: 'H-1', productCode: 'MK0000031442' },
    { zoneKey: 'H-1', productCode: 'MK0000063110' }
  ]);
  assert.deepEqual(steps.map((step) => step.type), ['product', 'product']);
  assert.deepEqual(steps.map((step) => step.item.productCode), ['MK0000031442', 'MK0000063110']);
});

test('접근 가능한 전체 화면 대화상자와 큰 존 책갈피를 제공한다', () => {
  assert.match(indexHtml, /id="continuous-scan-dialog"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*hidden/);
  assert.match(indexHtml, /id="continuous-scan-step"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /id="continuous-scan-bookmark"[^>]*role="note"[^>]*hidden/);
  assert.match(indexHtml, /continuous-scan-bookmark \{[^}]*min-height: min\(52vh, 420px\)/);
  assert.match(indexHtml, /id="closeScanModeBtn"[^>]*aria-label="연속 스캔 닫기"/);
});

test('하단 버튼, 키보드, 왼쪽 스와이프로 다음 항목으로 이동한다', () => {
  assert.match(indexHtml, /event\.key === 'ArrowRight'/);
  assert.match(indexHtml, /event\.key === 'ArrowLeft'/);
  assert.match(indexHtml, /event\.key === 'Escape'/);
  assert.match(indexHtml, /Math\.abs\(deltaX\) < 50/);
  assert.match(indexHtml, /if \(deltaX < 0\) showNextScanStep\(\)/);
  assert.match(indexHtml, /continuous-scan-controls \{[^}]*grid-template-columns: 1fr 1fr/);
});
