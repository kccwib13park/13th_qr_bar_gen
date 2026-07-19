import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('모바일 안전 영역과 동적 뷰포트 높이를 사용한다', () => {
  assert.match(indexHtml, /viewport-fit=cover/);
  assert.match(indexHtml, /env\(safe-area-inset-top\)/);
  assert.match(indexHtml, /env\(safe-area-inset-right\)/);
  assert.match(indexHtml, /env\(safe-area-inset-bottom\)/);
  assert.match(indexHtml, /env\(safe-area-inset-left\)/);
  assert.match(indexHtml, /min-height: 100svh/);
  assert.match(indexHtml, /min-height: 100dvh/);
});

test('320px 화면과 모바일 키보드에 대응하는 레이아웃 규칙을 제공한다', () => {
  assert.match(indexHtml, /@media \(max-width: 360px\)/);
  assert.match(indexHtml, /#bulk-inventory-list \{ max-height: min\(42dvh, 360px\)/);
  assert.match(indexHtml, /overflow-x: clip/);
  assert.match(indexHtml, /\.qrcode canvas,[\s\S]*max-width: 100%/);
});

test('주요 모바일 작업 버튼은 최소 44px 터치 영역을 확보한다', () => {
  assert.match(indexHtml, /\.qr-action-btn \{ min-height: 44px/);
  assert.match(indexHtml, /\.save-btn \{ display: block; min-height: 48px/);
  assert.match(indexHtml, /\.inventory-item-btn \{ width: 100%; min-height: 48px/);
  assert.match(indexHtml, /\.emoji-btn \{ min-width: 44px; min-height: 44px/);
});
