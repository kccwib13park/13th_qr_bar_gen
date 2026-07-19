import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('선택·스캔·모달 피드백에만 짧은 transform·opacity 모션을 사용한다', () => {
  assert.match(indexHtml, /\.inventory-item-btn \{[^}]*transition:[^}]*transform var\(--motion-fast\)/);
  assert.match(indexHtml, /function animateContinuousScanContent\(direction\)/);
  assert.match(indexHtml, /opacity: 0\.55, transform: `translateX\(\$\{offset\}px\)`/);
  assert.match(indexHtml, /duration: 180/);
  assert.match(indexHtml, /@keyframes modal-surface-in/);
  assert.match(indexHtml, /@keyframes toast-in/);
  assert.doesNotMatch(indexHtml, /#continuous-scan-qrcode[^}]*animation|#continuous-scan-qrcode[^}]*transition/);
});

test('모션 감소 설정에서는 CSS와 스캔 애니메이션을 모두 제거한다', () => {
  assert.match(indexHtml, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
  assert.match(indexHtml, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(indexHtml, /animation-duration: 0\.01ms !important/);
  assert.match(indexHtml, /transition-duration: 0\.01ms !important/);
});

test('작은 상단·하단 표면에만 점진적 backdrop-filter를 적용한다', () => {
  assert.match(indexHtml, /@supports \(\(backdrop-filter: blur\(8px\)\)/);
  assert.match(indexHtml, /\.page-header, \.continuous-scan-header, \.continuous-scan-controls, \.app-toast/);
  assert.match(indexHtml, /backdrop-filter: blur\(8px\) saturate\(115%\)/);
  assert.doesNotMatch(indexHtml, /#bulk-inventory-list[^}]*backdrop-filter/);
  assert.doesNotMatch(indexHtml, /\.qrcode-wrap[^}]*backdrop-filter/);
});
