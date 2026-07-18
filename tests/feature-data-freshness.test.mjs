import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const displayConfig = JSON.parse(await readFile(new URL('../data/location-display-config.json', import.meta.url), 'utf8'));

test('재고 데이터 기준일을 화면 상태로 표시한다', () => {
  assert.match(displayConfig.lastUpdated, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(indexHtml, /id="inventory-data-status"[^>]*data-state="loading"/);
  assert.match(indexHtml, /id="inventory-data-detail"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /lastUpdated: typeof json\?\.lastUpdated === 'string'/);
  assert.match(indexHtml, /기준일 \$\{lastUpdated\}/);
});

test('기준일 경과 일수를 날짜 경계 기준으로 계산한다', () => {
  const source = indexHtml.match(/function getInventoryDataAgeDays\(lastUpdated, now = new Date\(\)\) \{[\s\S]*?\n    \}/)?.[0];
  assert.ok(source);
  const getAgeDays = new Function(`${source}; return getInventoryDataAgeDays;`)();
  assert.equal(getAgeDays('2026-07-18', new Date('2026-07-18T23:59:00')), 0);
  assert.equal(getAgeDays('2026-07-17', new Date('2026-07-18T01:00:00')), 1);
  assert.equal(getAgeDays('2026-07-15', new Date('2026-07-18T01:00:00')), 3);
  assert.equal(getAgeDays('invalid', new Date('2026-07-18T01:00:00')), null);
});

test('최신·업데이트 필요·오프라인·데이터 없음 상태를 구분한다', () => {
  assert.match(indexHtml, /badge\.textContent = '최신 데이터'/);
  assert.match(indexHtml, /badge\.textContent = '업데이트 필요'/);
  assert.match(indexHtml, /badge\.textContent = '오프라인 데이터'/);
  assert.match(indexHtml, /badge\.textContent = '데이터 없음'/);
  assert.match(indexHtml, /ageDays > DATA_STALE_AFTER_DAYS/);
});

test('정상 데이터를 캐시하고 온라인 실패 시 마지막 정상본을 사용한다', () => {
  assert.match(indexHtml, /const DISPLAY_CONFIG_CACHE_KEY = 'qr_generator_display_config_cache_v1'/);
  assert.match(indexHtml, /function saveCachedDisplayConfig\(config\)/);
  assert.match(indexHtml, /function loadCachedDisplayConfig\(\)/);
  assert.match(indexHtml, /inventoryDataSource = cached \? 'cached' : 'unavailable'/);
  assert.match(indexHtml, /마지막 정상 데이터를 표시합니다/);
});
