import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const source = indexHtml.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n    \\}`))?.[0];
  assert.ok(source, `${name} 함수를 찾을 수 있어야 합니다.`);
  return source;
}

const getInventoryZoneGroupSource = extractFunction('getInventoryZoneGroup');
const compareInventoryZoneKeysSource = extractFunction('compareInventoryZoneKeys');
const buildContinuousScanStepsSource = extractFunction('buildContinuousScanSteps');
const classifySwipeGestureSource = extractFunction('classifySwipeGesture');
const getContinuousScanTransitionSource = extractFunction('getContinuousScanTransition');

const { getInventoryZoneGroup, compareInventoryZoneKeys, buildContinuousScanSteps } = new Function(`
  const INVENTORY_ZONE_PRIORITY = ['H1', 'BD', 'BC', 'AD', 'AC', 'OTHER'];
  ${getInventoryZoneGroupSource}
  ${compareInventoryZoneKeysSource}
  ${buildContinuousScanStepsSource}
  return { getInventoryZoneGroup, compareInventoryZoneKeys, buildContinuousScanSteps };
`)();

const { classifySwipeGesture, getContinuousScanTransition } = new Function(`
  ${classifySwipeGestureSource}
  ${getContinuousScanTransitionSource}
  return { classifySwipeGesture, getContinuousScanTransition };
`)();

test('대량 지번과 검색 결과의 존 우선순위는 H1, BD, BC, AD, AC, 나머지 순이다', () => {
  const zoneKeys = ['BA-1', 'AC-2', 'BC-2', 'H-1', 'AD-2', 'BD-2', 'BC-1', 'BD-1'];
  assert.deepEqual(zoneKeys.sort(compareInventoryZoneKeys), [
    'H-1', 'BD-1', 'BD-2', 'BC-1', 'BC-2', 'AD-2', 'AC-2', 'BA-1'
  ]);
  assert.match(indexHtml, /Object\.keys\(displayConfig\.rackProductCatalog\)\.sort\(compareInventoryZoneKeys\)/);
});

test('연속 스캔은 현재 검색 결과 전체를 제품 코드 QR 순서로 사용한다', () => {
  const scanSource = indexHtml.match(/function buildContinuousScanSteps[\s\S]*?function removeDirectHistoryItem/)?.[0] || '';
  assert.match(scanSource, /getFilteredInventoryItems\(rawQuery\)/);
  assert.match(scanSource, /scanStep\.item\.productCode/);
  assert.doesNotMatch(scanSource, /locationCode|적치 QR/);
  assert.match(indexHtml, /id="startScanModeBtn"[^>]*disabled>현재 목록 연속 스캔/);
  assert.match(indexHtml, /startScanModeBtn'\)\.disabled = filteredItems\.length === 0/);
});

test('H1에는 전환 안내가 없고 이후 존 앞에는 존 전환 안내가 들어간다', () => {
  const items = [
    { zoneKey: 'H-1', productCode: 'H01' },
    { zoneKey: 'H-1', productCode: 'H02' },
    { zoneKey: 'BD-1', productCode: 'BD01' },
    { zoneKey: 'BD-2', productCode: 'BD02' },
    { zoneKey: 'BC-1', productCode: 'BC01' },
    { zoneKey: 'AD-2', productCode: 'AD01' },
    { zoneKey: 'AC-2', productCode: 'AC01' },
    { zoneKey: 'BA-1', productCode: 'BA01' }
  ];
  const steps = buildContinuousScanSteps(items);

  assert.deepEqual(
    steps.map((step) => step.type === 'bookmark' ? `bookmark:${step.zoneLabel}` : step.item.productCode),
    ['H01', 'H02', 'bookmark:BD', 'BD01', 'BD02', 'bookmark:BC', 'BC01', 'bookmark:AD', 'AD01', 'bookmark:AC', 'AC01', 'bookmark:나머지 존', 'BA01']
  );
  assert.equal(getInventoryZoneGroup('H-1').hasBookmark, false);
  assert.match(indexHtml, /왼쪽으로 스와이프 하여 \$\{scanStep\.zoneLabel\} 계속 스캔/);
});

test('H1 검색 결과는 존 전환 안내 없이 제품 코드만 연속 표시한다', () => {
  const steps = buildContinuousScanSteps([
    { zoneKey: 'H-1', productCode: 'MK0000031442' },
    { zoneKey: 'H-1', productCode: 'MK0000063110' }
  ]);
  assert.deepEqual(steps.map((step) => step.type), ['product', 'product']);
  assert.deepEqual(steps.map((step) => step.item.productCode), ['MK0000031442', 'MK0000063110']);
});

test('접근 가능한 전체 화면 대화상자와 큰 존 전환 안내를 제공한다', () => {
  assert.match(indexHtml, /id="continuous-scan-dialog"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*hidden/);
  assert.match(indexHtml, /id="continuous-scan-step"[^>]*aria-live="polite"/);
  assert.match(indexHtml, /id="continuous-scan-bookmark"[^>]*role="note"[^>]*hidden/);
  assert.match(indexHtml, /continuous-scan-bookmark \{[^}]*min-height: min\(52vh, 420px\)/);
  assert.match(indexHtml, /<p class="continuous-scan-bookmark-label">존 전환 안내<\/p>/);
  assert.match(indexHtml, /'나머지 존 전환 안내'/);
  assert.match(indexHtml, /`\$\{scanStep\.zoneLabel\} 존 전환 안내`/);
  assert.doesNotMatch(indexHtml, /존 책갈피/);
  assert.match(indexHtml, /id="closeScanModeBtn"[^>]*aria-label="연속 스캔 닫기"/);
});

test('버튼, 키보드, 스와이프가 공통 단계 이동 함수를 사용한다', () => {
  assert.match(indexHtml, /event\.key === 'ArrowRight'/);
  assert.match(indexHtml, /event\.key === 'ArrowLeft'/);
  assert.match(indexHtml, /event\.key === 'Escape'/);
  assert.match(indexHtml, /moveContinuousScanStep\(1\)/);
  assert.match(indexHtml, /moveContinuousScanStep\(-1\)/);
  assert.match(indexHtml, /moveContinuousScanStep\(direction\)/);
  assert.match(indexHtml, /continuous-scan-controls \{[^}]*grid-template-columns: 1fr 1fr/);
});

test('수평 스와이프만 방향으로 판정하고 탭과 수직 스크롤은 무시한다', () => {
  assert.equal(classifySwipeGesture({ deltaX: -80, deltaY: 12, durationMs: 300 }), 1);
  assert.equal(classifySwipeGesture({ deltaX: 80, deltaY: 12, durationMs: 300 }), -1);
  assert.equal(classifySwipeGesture({ deltaX: -30, deltaY: 2, durationMs: 100 }), 0);
  assert.equal(classifySwipeGesture({ deltaX: -80, deltaY: 100, durationMs: 300 }), 0);
  assert.equal(classifySwipeGesture({ deltaX: -60, deltaY: 4, durationMs: 700 }), 0);
  assert.equal(classifySwipeGesture({ deltaX: -60, deltaY: 4, durationMs: 120 }), 1);
  assert.match(indexHtml, /pointercancel', cancelContinuousScanPointer/);
  assert.match(indexHtml, /lostpointercapture', cancelContinuousScanPointer/);
  assert.match(indexHtml, /Math\.abs\(deltaY\) > Math\.abs\(deltaX\)/);
});

test('첫 단계 이전은 유지하고 마지막 단계 다음은 기존 완료 동작을 실행한다', () => {
  assert.deepEqual(getContinuousScanTransition(0, 3, -1), { action: 'stay', step: 0 });
  assert.deepEqual(getContinuousScanTransition(1, 3, -1), { action: 'move', step: 0 });
  assert.deepEqual(getContinuousScanTransition(1, 3, 1), { action: 'move', step: 2 });
  assert.deepEqual(getContinuousScanTransition(2, 3, 1), { action: 'complete', step: 2 });
});

test('연속 스캔과 QR 확대 대화상자는 외부 포커스를 차단하고 포커스를 복귀한다', () => {
  assert.match(indexHtml, /function trapDialogFocus\(event, dialog\)/);
  assert.match(indexHtml, /setPageContentInert\(true\)/);
  assert.match(indexHtml, /setPageContentInert\(false\)/);
  assert.match(indexHtml, /continuousScanPreviousFocus instanceof HTMLElement/);
  assert.match(indexHtml, /qrActionDialogPreviousFocus instanceof HTMLElement/);
  assert.match(indexHtml, /aria-describedby="continuous-scan-step"/);
  assert.match(indexHtml, /aria-describedby="qr-action-dialog-value"/);
});
