import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const source = indexHtml.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n    \\}`))?.[0];
  assert.ok(source, `${name} 함수를 찾을 수 있어야 합니다.`);
  return source;
}

const normalizeInventorySearch = new Function(
  `${extractFunction('normalizeInventorySearch')}; return normalizeInventorySearch;`
)();
const buildExactInventoryIndex = new Function(
  `${extractFunction('buildExactInventoryIndex')}; return buildExactInventoryIndex;`
)();

test('검색어 정규화는 한국어·코드 의미를 보존하며 대소문자와 공백만 통일한다', () => {
  assert.equal(normalizeInventorySearch(' 전용 목장 우유 '), '전용목장우유');
  assert.equal(normalizeInventorySearch(' mk0000030559 '), 'mk0000030559');
  assert.equal(normalizeInventorySearch('1F-H1-13-1'), '1f-h1-13-1');
  assert.equal(normalizeInventorySearch('멀티  밴더'), '멀티밴더');
});

test('정확 일치 인덱스는 원래 순서와 중복 판정 의미를 보존한다', () => {
  const first = { itemKey: 'first', exactSearchKeys: ['same', 'first'] };
  const second = { itemKey: 'second', exactSearchKeys: ['same', 'second'] };
  const index = buildExactInventoryIndex([first, second]);

  assert.deepEqual(index.get('same'), [first, second]);
  assert.deepEqual(index.get('first'), [first]);
  assert.equal(index.has('missing'), false);
});

test('빠른 검색 입력은 최신 요청만 렌더하고 Enter 선택은 대기 작업을 무효화한다', () => {
  const inputHandler = extractFunction('handleInventorySearchInput');
  const keydownHandler = extractFunction('handleInventorySearchKeydown');
  assert.match(inputHandler, /const requestId = \+\+inventorySearchRequestId/);
  assert.match(inputHandler, /requestId === inventorySearchRequestId/);
  assert.match(keydownHandler, /inventorySearchRequestId \+= 1/);
  assert.match(keydownHandler, /exactMatches\.length !== 1/);
});
