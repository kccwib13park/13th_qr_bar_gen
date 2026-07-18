import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('빈 제품 코드는 QR이나 저장값으로 대체되지 않는다', () => {
  assert.doesNotMatch(indexHtml, /\.trim\(\)\s*\|\|\s*['"]품명 공백['"]/);
  assert.match(indexHtml, /if \(!productText\) \{[\s\S]*?saveButton\.disabled = true;/);
  assert.match(indexHtml, /if \(!renderProductPreview\(\)\) return;/);
});

test('재고 검색 한 건 결과를 자동 선택하지 않는다', () => {
  assert.doesNotMatch(indexHtml, /filteredItems\.length === 1/);
  assert.match(indexHtml, /clearInventorySelection\(\{ clearLinkedProduct: true \}\)/);
  assert.match(indexHtml, /function applyInventoryItem\(item\) \{[\s\S]*?renderProductPreview\(\);/);
});

test('설정 로드 실패를 화면에 알린다', () => {
  assert.match(indexHtml, /id="config-warning"[^>]*role="alert"/);
  assert.match(indexHtml, /showConfigWarnings\(warnings\)/);
});

test('저장소 쓰기 실패가 앱 실행을 중단하지 않는다', () => {
  assert.match(indexHtml, /function saveHistory\(items\) \{\s*try \{/);
  assert.match(indexHtml, /function saveDirectHistory\(items\) \{\s*try \{/);
});
