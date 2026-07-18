import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const workflow = await readFile(new URL('../.github/workflows/validate.yml', import.meta.url), 'utf8');

test('인라인 애플리케이션 스크립트 구문이 유효하다', () => {
  const inlineScripts = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  assert.ok(inlineScripts.length > 0);
  inlineScripts.forEach((script) => new vm.Script(script));
});

test('QR 라이브러리는 고정 버전과 무결성 검증을 사용한다', () => {
  assert.match(indexHtml, /qrcodejs\/1\.0\.0\/qrcode\.min\.js/);
  assert.match(indexHtml, /integrity="sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA=="/);
  assert.match(indexHtml, /crossorigin="anonymous"/);
  assert.match(indexHtml, /\sdefer(?:\s|>)/);
});

test('QR 라이브러리 실패는 사용자 경고와 저장 차단으로 이어진다', () => {
  assert.match(indexHtml, /window\.qrLibraryLoadFailed = true/);
  assert.match(indexHtml, /function isQRCodeAvailable\(\)/);
  assert.match(indexHtml, /QR 생성 라이브러리를 불러오지 못했습니다/);
  assert.match(indexHtml, /status\.textContent = 'QR 사용 불가'/);
});

test('외부 설정을 불러온 뒤 화면을 한 번 초기화한다', () => {
  const initializer = indexHtml.match(/async function initializeApp\(\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(initializer, /await hydrateExternalConfigs\(\);[\s\S]*initializeZoneInputs\(\);/);
  assert.match(initializer, /renderInventoryList\(\);[\s\S]*previewQR\(\);/);
  assert.equal((initializer.match(/renderInventoryList\(/g) || []).length, 1);
  assert.doesNotMatch(indexHtml, /cache: 'no-store'/);
  assert.match(indexHtml, /cache: 'no-cache'/);
});

test('표준 테스트 명령과 CI 검증이 정의되어 있다', () => {
  assert.equal(packageJson.scripts.test, 'node --test');
  assert.match(workflow, /actions\/setup-node@v4/);
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /run: npm test/);
});
