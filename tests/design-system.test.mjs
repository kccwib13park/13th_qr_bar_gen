import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('업무용 청회색 디자인 토큰을 한 곳에서 정의한다', () => {
  for (const token of [
    '--color-bg', '--color-bg-elevated', '--color-surface', '--color-surface-strong',
    '--color-border', '--color-border-strong', '--color-text', '--color-text-muted',
    '--color-primary', '--color-primary-hover', '--color-success', '--color-warning',
    '--color-danger', '--color-focus', '--shadow-sm', '--shadow-md', '--radius-sm',
    '--radius-md', '--radius-lg', '--motion-fast', '--motion-normal'
  ]) {
    assert.match(indexHtml, new RegExp(`${token}:`));
  }
});

test('시스템 한국어 글꼴과 명확한 타이포그래피 토큰을 사용한다', () => {
  assert.match(indexHtml, /--font-body:[^;]*Apple SD Gothic Neo[^;]*Malgun Gothic/);
  assert.match(indexHtml, /--font-code:/);
  for (const token of ['--type-display', '--type-heading', '--type-body', '--type-label', '--type-caption', '--type-code']) {
    assert.match(indexHtml, new RegExp(`${token}:`));
  }
  assert.match(indexHtml, /font-size: var\(--type-body\)/);
  assert.doesNotMatch(indexHtml, /@font-face|fonts\.googleapis\.com/);
});

test('선택 상태와 키보드 포커스를 색상 외 표현으로도 구분한다', () => {
  assert.match(indexHtml, /\.inventory-item-btn\.is-selected::after \{ content: '선택됨 ✓'/);
  assert.match(indexHtml, /box-shadow: inset 3px 0 0 var\(--color-focus\)/);
  assert.match(indexHtml, /:focus-visible \{ outline: 3px solid var\(--color-focus\)/);
});

test('QR은 흰 배경과 스캔 여백을 유지하고 코드 문자열만 강제 줄바꿈한다', () => {
  assert.match(indexHtml, /\.qrcode-wrap \{[^}]*padding: 10px;[^}]*background: #ffffff/);
  assert.match(indexHtml, /\.continuous-scan-qr \{[^}]*padding: 12px;[^}]*background: #ffffff/);
  assert.match(indexHtml, /font-family: var\(--font-code\)/);
  assert.match(indexHtml, /overflow-wrap: anywhere/);
});
