import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('제품과 적치 QR에 확대·복사·다운로드·공유 작업을 제공한다', () => {
  for (const source of ['product', 'location']) {
    for (const action of ['expand', 'copy', 'download', 'share']) {
      assert.match(indexHtml, new RegExp(`data-qr-source="${source}" data-qr-action="${action}"`));
    }
  }
});

test('QR 확대 대화상자와 접근 가능한 완료 토스트를 제공한다', () => {
  assert.match(indexHtml, /id="qr-action-dialog"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*hidden/);
  assert.match(indexHtml, /id="closeQrActionDialogBtn"[^>]*aria-label="QR 확대 닫기"/);
  assert.match(indexHtml, /id="app-toast"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /function openQRActionDialog\(data, trigger\)/);
  assert.match(indexHtml, /function showToast\(message\)/);
});

test('복사·PNG 다운로드·모바일 공유와 미지원 복사 대체를 구현한다', () => {
  assert.match(indexHtml, /navigator\.clipboard\?\.writeText/);
  assert.match(indexHtml, /canvas\.toDataURL\('image\/png'\)/);
  assert.match(indexHtml, /link\.download = getQRFilename\(data\)/);
  assert.match(indexHtml, /navigator\.canShare\(\{ files: \[file\] \}\)/);
  assert.match(indexHtml, /공유를 지원하지 않아 QR 값을 복사했습니다/);
});

test('QR이 없을 때 작업 버튼을 비활성화하고 저장 성공을 알린다', () => {
  assert.match(indexHtml, /function setQRActionButtonsEnabled\(source, enabled\)/);
  assert.match(indexHtml, /setQRActionButtonsEnabled\('product', false\)/);
  assert.match(indexHtml, /setQRActionButtonsEnabled\('location', true\)/);
  assert.match(indexHtml, /제품·위치 작업을 저장했습니다/);
  assert.match(indexHtml, /제품 코드를 저장했습니다/);
  assert.match(indexHtml, /적치 구역을 저장했습니다/);
});
