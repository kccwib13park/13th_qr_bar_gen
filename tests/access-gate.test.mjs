import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('앱은 접근 확인 전 화면과 보조 기술에서 숨겨진다', () => {
  assert.match(indexHtml, /<body class="access-locked">/);
  assert.match(indexHtml, /<main id="access-gate"[^>]*aria-labelledby="access-title"/);
  assert.match(indexHtml, /<div id="app-shell"[^>]*role="main"[^>]*hidden inert>/);
  assert.match(indexHtml, /<noscript>[\s\S]*JavaScript를 활성화/);
});

test('접근 폼은 키보드와 보조 기술용 정보를 제공한다', () => {
  assert.match(indexHtml, /<form id="access-form"[^>]*novalidate>/);
  assert.match(indexHtml, /<label[^>]*for="access-password"/);
  assert.match(indexHtml, /id="access-password"[^>]*type="password"/);
  assert.match(indexHtml, /id="access-error"[^>]*role="alert"/);
  assert.match(indexHtml, /id="access-status"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /id="access-password-toggle"[^>]*aria-pressed="false"/);
});

test('평문 대신 느린 PBKDF2 검증값을 사용한다', () => {
  const salt = indexHtml.match(/saltBase64: '([^']+)'/)?.[1] || '';
  const verifier = indexHtml.match(/verifierBase64: '([^']+)'/)?.[1] || '';

  assert.equal(Buffer.from(salt, 'base64').length, 16);
  assert.equal(Buffer.from(verifier, 'base64').length, 32);
  assert.match(indexHtml, /iterations: 600000/);
  assert.match(indexHtml, /window\.crypto\.subtle\.importKey\(/);
  assert.match(indexHtml, /window\.crypto\.subtle\.deriveBits\(\{/);
  assert.match(indexHtml, /name: 'PBKDF2'/);
  assert.match(indexHtml, /hash: 'SHA-256'/);
  assert.match(indexHtml, /function accessBytesMatch\(left, right\)/);
  assert.doesNotMatch(indexHtml, /password\s*:\s*['"][^'"]+['"]/i);
});

test('유효한 세션만 앱을 초기화하고 잠금 시 세션을 제거한다', () => {
  assert.match(indexHtml, /const ACCESS_SESSION_KEY = 'qr_generator_access_session_v1'/);
  assert.match(indexHtml, /window\.sessionStorage\.getItem\(key\)/);
  assert.match(indexHtml, /sessionDurationMs: 8 \* 60 \* 60 \* 1000/);
  assert.match(indexHtml, /function getValidAccessSession\(now = Date\.now\(\)\)/);
  assert.match(indexHtml, /async function unlockApplication\(session\) \{[\s\S]*?initializeApp\(\)/);
  assert.match(indexHtml, /function lockApplication\(\) \{[\s\S]*?removeAccessStorage\(ACCESS_SESSION_KEY\);[\s\S]*?window\.location\.reload\(\);/);
  assert.match(indexHtml, /window\.addEventListener\('DOMContentLoaded', initializeAccessGate\)/);
  assert.doesNotMatch(indexHtml, /window\.addEventListener\('DOMContentLoaded', initializeApp\)/);
});

test('연속 실패는 같은 탭에서 일시적으로 입력을 제한한다', () => {
  assert.match(indexHtml, /maxAttempts: 5/);
  assert.match(indexHtml, /lockDurationMs: 30 \* 1000/);
  assert.match(indexHtml, /const ACCESS_FAILURE_KEY = 'qr_generator_access_failure_v1'/);
  assert.match(indexHtml, /function startAccessLockCountdown\(\)/);
  assert.match(indexHtml, /초 후 다시 시도할 수 있습니다/);
});
