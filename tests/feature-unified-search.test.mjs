import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('검색 인덱스에 제품명·코드·표시 위치·QR 위치·존 정보를 포함한다', () => {
  const indexBuilder = indexHtml.match(/function rebuildInventoryIndex\(\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(indexBuilder, /product\.productName/);
  assert.match(indexBuilder, /product\.productCode/);
  assert.match(indexBuilder, /product\.location/);
  assert.match(indexBuilder, /locationCode/);
  assert.match(indexBuilder, /zoneKey/);
  assert.match(indexBuilder, /zoneCodeLabel/);
  assert.match(indexBuilder, /zoneType/);
  assert.match(indexBuilder, /normalizedSearchText/);
});

test('통합 검색 UI가 스캐너 친화적인 입력 설정을 제공한다', () => {
  assert.match(indexHtml, /<label for="inventory-search">제품·코드·위치·존 검색<\/label>/);
  assert.match(indexHtml, /id="inventory-search"[^>]*enterkeyhint="search"/);
  assert.match(indexHtml, /MK0000030559, 1F-H1-13-1/);
});

test('Enter는 정확히 한 항목과 일치할 때만 선택한다', () => {
  const handler = indexHtml.match(/function handleInventorySearchKeydown\(event\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(handler, /event\.key !== 'Enter'/);
  assert.match(handler, /exactInventoryItemsByKey\.get\(query\)/);
  assert.match(handler, /exactMatches\.length !== 1/);
  assert.match(handler, /applyInventoryItem\(exactMatches\[0\]\)/);
  assert.match(indexHtml, /addEventListener\('keydown', handleInventorySearchKeydown\)/);
});
