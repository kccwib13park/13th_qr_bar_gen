import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('핵심 입력과 작업 영역은 이름·상태·설명 관계를 제공한다', () => {
  assert.match(indexHtml, /<label for="inventory-search">/);
  assert.match(indexHtml, /id="inventory-search-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /id="app-toast"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /data-qr-action="expand" aria-label="제품 QR 확대"/);
  assert.match(indexHtml, /data-qr-action="download" aria-label="적치 QR 이미지 다운로드"/);
});

test('두 모달은 제목·설명·포커스 트랩·Escape 종료·포커스 복귀를 유지한다', () => {
  assert.match(indexHtml, /id="continuous-scan-dialog"[^>]*aria-labelledby="continuous-scan-heading"[^>]*aria-describedby="continuous-scan-step"/);
  assert.match(indexHtml, /id="qr-action-dialog"[^>]*aria-labelledby="qr-action-dialog-title"[^>]*aria-describedby="qr-action-dialog-value"/);
  assert.match(indexHtml, /function trapDialogFocus\(event, dialog\)/);
  assert.match(indexHtml, /if \(event\.key === 'Escape'\)/);
  assert.match(indexHtml, /continuousScanPreviousFocus instanceof HTMLElement/);
  assert.match(indexHtml, /qrActionDialogPreviousFocus instanceof HTMLElement/);
});

test('키보드 포커스와 모션 감소 환경은 시각 효과 없이도 상태를 구분한다', () => {
  assert.match(indexHtml, /:focus-visible \{[^}]*outline: 3px solid var\(--color-focus\)/);
  assert.match(indexHtml, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(indexHtml, /\.inventory-item-btn\.is-selected::after[^}]*content: '선택됨 ✓'/);
  assert.match(indexHtml, /aria-pressed/);
});
