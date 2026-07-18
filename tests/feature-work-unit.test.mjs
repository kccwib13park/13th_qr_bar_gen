import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('재고 위치를 존·번호·렉·칸으로 파싱해 두 QR에 적용한다', () => {
  assert.match(indexHtml, /function parseInventoryLocation\(location\)/);
  assert.match(indexHtml, /\^1F-\(\[A-Z\]\+\)\(\\d\+\)-\(\\d\+\)-\(\\d\+\)\$/);
  const applyItem = indexHtml.match(/function applyInventoryItem\(item\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(applyItem, /renderProductPreview\(\)/);
  assert.match(applyItem, /applyHistoryToInputs\(location\)/);
  assert.match(applyItem, /renderLocationPreview\(\)/);
});

test('제품·위치 작업을 별도 최근 내역으로 저장하고 다시 적용한다', () => {
  assert.match(indexHtml, /const WORK_UNIT_HISTORY_KEY = 'qr_generator_work_unit_history_v1'/);
  assert.match(indexHtml, /id="saveWorkUnitBtn"[^>]*disabled/);
  assert.match(indexHtml, /id="work-unit-history-list"/);
  assert.match(indexHtml, /function saveSelectedWorkUnit\(\)/);
  assert.match(indexHtml, /function renderWorkUnitHistory\(\)/);
  assert.match(indexHtml, /function handleWorkUnitHistorySelect\(item\)/);
});

test('제품이나 위치가 바뀌면 작업 단위 선택을 해제한다', () => {
  assert.match(indexHtml, /selectedInventoryItem = null/);
  assert.match(indexHtml, /saveWorkUnitBtn'\)\.disabled = true/);
  assert.match(indexHtml, /if \(selectedInventoryItem\) clearInventorySelection\(\)/);
});
