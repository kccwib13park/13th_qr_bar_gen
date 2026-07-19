import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('제품 입력은 적치 QR 렌더링 경로를 호출하지 않는다', () => {
  const handler = indexHtml.match(/function handleProductInput\(\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(handler, /renderProductPreview\(\)/);
  assert.doesNotMatch(handler, /previewQR|renderLocationPreview/);
});

test('현재 적치값 조회는 선택 옵션을 다시 만들지 않는다', () => {
  const payload = indexHtml.match(/function getCurrentPayload\(\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.doesNotMatch(payload, /updateRackCellOptions|applyInputStateOnly/);
  assert.doesNotMatch(indexHtml, /function applyInputStateOnly/);
});

test('대량 지번 검색은 사전 계산 인덱스와 단일 이벤트 리스너를 사용한다', () => {
  assert.match(indexHtml, /function rebuildInventoryIndex\(\)/);
  assert.match(indexHtml, /normalizedSearchText: normalizeInventorySearch/);
  assert.match(indexHtml, /item\.normalizedSearchText\.includes\(query\)/);
  assert.match(indexHtml, /new Map\(inventoryItems\.map/);
  assert.match(indexHtml, /exactInventoryItemsByKey\.get\(query\)/);
  assert.match(indexHtml, /createDocumentFragment\(\)/);
  assert.match(indexHtml, /inventoryList\.replaceChildren\(fragment\)/);
  assert.match(indexHtml, /bulk-inventory-list'\)\.addEventListener\('click', handleInventoryListClick\)/);
  assert.doesNotMatch(indexHtml, /button\.addEventListener\('click', \(\) => applyInventoryItem/);
});

test('검색 입력은 디바운스하고 애니메이션은 강제 레이아웃을 만들지 않는다', () => {
  assert.match(indexHtml, /requestId === inventorySearchRequestId/);
  assert.match(indexHtml, /}, 90\)/);
  assert.match(indexHtml, /const liveUpdateTimers = new WeakMap\(\)/);
  assert.doesNotMatch(indexHtml, /offsetWidth/);
});

test('선택 상태와 QR 렌더링은 변경된 대상만 갱신한다', () => {
  assert.match(indexHtml, /let inventoryButtonByKey = new Map\(\)/);
  assert.match(indexHtml, /function updateInventorySelectedButton/);
  assert.doesNotMatch(indexHtml, /querySelectorAll\('\.inventory-item-btn'\)\.forEach/);
  assert.match(indexHtml, /const renderedQRCodes = new WeakMap\(\)/);
  assert.match(indexHtml, /previousRender\?\.text === qrText/);
  assert.match(indexHtml, /renderedQRCodes\.set\(qrcodeDiv, \{ text: qrText, size \}\)/);
});
