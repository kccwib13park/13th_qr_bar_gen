import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('주요 섹션은 대량 지번, 적치 QR, 제품 QR, 최근 저장 내역 순서다', () => {
  const inventoryIndex = indexHtml.indexOf('id="bulk-inventory-container"');
  const locationIndex = indexHtml.indexOf('id="location-card"');
  const productIndex = indexHtml.indexOf('id="product-card"');
  const historyIndex = indexHtml.indexOf('id="history-container"');

  assert.ok(inventoryIndex >= 0);
  assert.ok(inventoryIndex < locationIndex);
  assert.ok(locationIndex < productIndex);
  assert.ok(productIndex < historyIndex);
});

test('대량 지번 제목에는 이모지가 있고 최근 내역은 로컬 저장 방식을 설명한다', () => {
  assert.match(indexHtml, /id="bulk-inventory-title">🗂️ 대량 지번 재고 목록<\/h3>/);
  assert.match(indexHtml, /class="history-desc"/);
  assert.match(indexHtml, /브라우저의 로컬 스토리지에만 보관됩니다/);
  assert.match(indexHtml, /다른 기기와는 동기화되지 않으며/);
  assert.match(indexHtml, /삭제하면 복구할 수 없습니다/);
});
