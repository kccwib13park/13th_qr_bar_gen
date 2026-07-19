import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const displayConfig = JSON.parse(await readFile(new URL('../data/location-display-config.json', import.meta.url), 'utf8'));

function extractFunction(name) {
  const source = indexHtml.match(new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n    \\}`))?.[0];
  assert.ok(source, `${name} 함수를 찾을 수 있어야 합니다.`);
  return source;
}

const expectedMultivendorRows = [
  ['M00000522908', '[비프][선][낱개]워싱턴생체리300g(10row)', 2, 540, '확인필요', true],
  ['MK0000027319', '[비프]선)알배기배추', 2, 300, '보충', true],
  ['MK0000031100', '[비프]선)양상추1통 230g', 2, 136, '확인필요', true],
  ['MK0000054660', '[비프]선)[KF365] 브로콜리 1입', 3, 240, '확인필요', true],
  ['MK0000159977', '[비프]★[박스]황도복숭아1.2kg(4~6입)', 2, 220, '확인필요', false],
  ['MK0000027318', '[비프]선)깐마늘200g', 2, 240, '확인필요', true],
  ['MK0000007236', '[비프]선)아삭오도로끼복숭아1.2kg(4-5입)', 2, 180, '확인필요', true],
  ['MK0000079292', '[비프]선)대극천아삭복숭아1kg', 2, 120, '보충', false],
  ['MK0000054657', '[비프][낱개]다다기오이3입', 2, 200, '보충', true],
  ['MK0000063699', '[비프][낱개]청경채300g', 2, 120, '확인필요', true],
  ['M00000060435', '선)[낱개][KF365] 머스크멜론 1.6kg', 2, 90, '보충', true],
  ['MK0000038085', '[비프][선][낱개]애플수박1kg', 2, 70, '확인필요', true],
  ['MK0000027320', '[비프]선)깐대파 500g', 2, 100, '확인필요', true],
  ['MK0000027770', '[비프]선)[KF365] 오이맛고추 150g', 2, 60, '확인필요', true],
  ['MK0000027769', '[비프]선)[KF365] 꽈리고추 100g', 2, 60, '확인필요', true],
  ['MK0000053497', '[비프][낱개]조각양배추500g', 3, 84, '확인필요', true],
  ['MK0000053496', '[비프][낱개]한통양배추 900g', 3, 80, '확인필요', true],
  ['MK0000056795', '[비프]선)미니파프리카200g', 2, 40, '확인필요', true],
  ['M00000054870', '[비프]선)[제각각]청양고추300g', 2, 50, '확인필요', true],
  ['MK0000026449', '[비프]선)호박고구마800g/봉', 2, 60, '확인필요', false],
  ['MK0000061352', '[비프]선)청양고추200g', 2, 60, '확인필요', true],
  ['MK0000065493', '[비프]선)[KF365] 꽈리고추 200g', 2, 33, '확인필요', false],
  ['MK0000036664', '[비프]선)[KF365] 깐쪽파 200g', 2, 20, '확인필요', false]
];

const expectedBulkRows = {
  'AC-2': [
    ['1F-AC2-1-1', 'MK0000026451', '양파 1.5kg/망'],
    ['1F-AC2-2-1', 'M00000763750', '[제각각] 흙대파 1kg'],
    ['1F-AC2-5-1', 'MK0000041020', '한끼 채소 손질 대파'],
    ['1F-AC2-6-1', 'MK0000058732', '[KF365]참타리버섯 200g'],
    ['1F-AC2-7-1', 'M00000456944', '스테비아 대추방울토마토 1kg'],
    ['1F-AC2-8-1', 'MK0000027320', '깐대파 500g'],
    ['1F-AC2-9-1', 'M00000743307', '[KF365] 한통 양배추 1.5kg'],
    ['1F-AC2-10-1', 'MK0000026448', '감자 1kg/봉'],
    ['1F-AC2-11-1', 'MK0000061259', '고랭지 사과 1.3kg'],
    ['1F-AC2-13-1', 'MK0000063690', '완숙토마토 1kg'],
    ['1F-AC2-14-1', 'MK0000031395', '[KF365] 무 1통(1kg)'],
    ['1F-AC2-16-1', 'M00000414730', '고소&아삭한 유러피안 채소팩 300g'],
    ['1F-AC2-18-1', 'M00000220902', '거봉 포도 650g'],
    ['1F-AC2-19-1', 'P00000CR000A', '[바름팜] 친환경 당근'],
    ['1F-AC2-20-1', 'MK0000049921', '[KF365] 새송이버섯 400g'],
    ['1F-AC2-21-1', 'MK0000071102', '[KF365] 친환경 표고버섯 300g'],
    ['1F-AC2-22-1', 'MK0000063700', '양파 3kg'],
    ['1F-AC2-23-1', 'MK0000030557', '[KF365] 파프리카 2입'],
    ['1F-AC2-24-1', 'M00000038416', '채소믹스 500g'],
    ['1F-AC2-25-1', 'M00000157492', '싱그러운 유러피안 샐러드믹스 110g'],
    ['1F-AC2-26-1', 'MK0000031100', '양상추 1통'],
    ['1F-AC2-27-1', 'MK0000049631', '성주 참외 1.5kg'],
    ['1F-AC2-28-1', 'MK0000054660', '[KF365] 브로콜리 1입'],
    ['1F-AC2-29-1', 'M00000157493', '싱그러운 유러피안 샐러드믹스 200g'],
    ['1F-AC2-30-1', 'M00000728814', '[제각각] 작은 양배추 1통(600g)']
  ],
  'AD-2': [
    ['1F-AD2-11-1', 'M00000743834', '[YOZM] 드링크 그릭요거트 스타터 1.8L'],
    ['1F-AD2-12-1', 'M00000742226', '[KF365] 생 등심 돈까스 500g (냉장)'],
    ['1F-AD2-13-1', 'M00000486379', '[김구원선생] 장수콩나물 600g'],
    ['1F-AD2-14-1', 'MK0000007236', '아삭 오도로끼 복숭아 1.2kg (4-5입)'],
    ['1F-AD2-15-1', 'M00000231710', '[남양] 불가리스 그릭 요거트 설탕 무첨가 플레인 400g'],
    ['1F-AD2-16-1', 'M00000826614', '바로먹는 아보카도(3입) (페루산)'],
    ['1F-AD2-18-1', 'M00000519822', '[바름팜] 친환경 당근 1kg'],
    ['1F-AD2-19-1', 'M00000020697', '유명산지 고당도사과 1.5kg'],
    ['1F-AD2-20-1', 'M00000582306', '와일드 루꼴라 100g']
  ],
  'H-1': [
    ['1F-H1-1-1', 'MK0000031442', '[DOLE] 스위티오 바나나 1kg'],
    ['1F-H1-2-1', 'MK0000063110', '[연세우유 x 마켓컬리] 전용목장우유 900mL'],
    ['1F-H1-3-1', 'MK0000118043', "[Kurly's] 국산콩 2컵두부"],
    ['1F-H1-4-1', 'M00000445542', '[차려낸] 햄 가득 송탄식 부대찌개'],
    ['1F-H1-5-1', 'MK0000031391', '[KF365] 팽이버섯 300g 2입'],
    ['1F-H1-6-1', 'M00000105897', '[연세우유 x 마켓컬리] 전용목장우유 1.8L'],
    ['1F-H1-7-1', 'MK0000054657', '다다기오이 3입'],
    ['1F-H1-8-1', 'MK0000118044', "[Kurly's] 국산콩 두부 500g"],
    ['1F-H1-9-1', 'MK0000097217', '[매일] 바이오 그릭 요거트 400g'],
    ['1F-H1-10-1', 'MK0000053329', "[Kurly's] 국산콩 두부"],
    ['1F-H1-11-1', 'M00000039379', '무농약 국산콩 콩나물 300g'],
    ['1F-H1-12-1', 'MK0000063578', '[KF365] 대추방울토마토 750g'],
    ['1F-H1-13-1', 'MK0000030559', '애호박'],
    ['1F-H1-14-1', 'M00000052481', '[KF365] 통통한 그릴 비엔나 소시지 700g'],
    ['1F-H1-15-1', 'M00000060435', '[KF365] 머스크멜론 1.6kg'],
    ['1F-H1-16-1', 'M00000039339', '와일드 루꼴라 50g'],
    ['1F-H1-17-1', 'MK0000081598', '[서울우유x마켓컬리] 치즈다운 치즈'],
    ['1F-H1-18-1', 'M00000195798', '스테비아 대추방울토마토 450g'],
    ['1F-H1-19-1', 'MK0000012569', 'MY FIRST 처음 만나는 진짜 모닝롤'],
    ['1F-H1-20-1', 'M00000035562', '[제주우유] 제주목초우유 무항생제 750mL'],
    ['1F-H1-21-1', 'MK0000031441', '[kf365] [DOLE] 실속 바나나 1kg']
  ],
  'BA-1': [
    ['1F-BA1-1-1', 'MK0000053840', '[누테이블] 메추리알 장조림 350g'],
    ['1F-BA1-2-1', 'M00000590569', '[아프로그릭] 유당제로 그릭요거트 100g'],
    ['1F-BA1-3-1', 'M00000030607', '[조인] 동물복지 유정 반숙란 20구'],
    ['1F-BA1-4-1', 'M00000263720', '[99계란] 99구운란 30구 (15구*2ea)'],
    ['1F-BA1-5-1', 'M00000556611', '[KF365] 무항생제 특란 40구 (20구*2ea)'],
    ['1F-BA1-6-1', 'M00000184691', '[가농바이오] 단백이'],
    ['1F-BA1-7-1', 'M00000039209', '[가농바이오] 촉촉하게 삶아낸 반숙란 20구'],
    ['1F-BA1-8-1', 'M00000036657', '[KF365] 깐 메추리알 800g'],
    ['1F-BA1-9-1', 'M00000035227', '[자연애찬] 비빔 반숙란 (수란) 10구'],
    ['1F-BA1-10-1', 'MK0000119903', '[KF365] 1+등급 무항생제 대란 20구'],
    ['1F-BA1-11-1', 'M00000521204', '[1] [모두의식단] 냉장 닭가슴살 100g(냉장) 10개입'],
    ['1F-BA1-12-1', 'M00000063458', '[KF365] 무항생제 백색 대란 20구'],
    ['1F-BA1-13-1', 'M00000043766', "[Kurly's] 자유방목 동물복지 유정란 10구"],
    ['1F-BA1-14-1', 'M00000814748', '[상하농원] 동물복지 구운란 15구']
  ],
  'BC-1': [
    ['1F-BC1-24-1', 'MK0000061738', '[빙그레] 바나나맛 우유 4개입'],
    ['1F-BC1-25-1', 'M00000860691', '[아카페라] 심플리 로어슈거 라떼 (400mL X 6개)'],
    ['1F-BC1-26-1', 'MK0000141883', '[오뚜기] 짜슐랭 5입'],
    ['1F-BC1-27-1', 'MK0000025634', '[슈퍼너츠] 피넛버터 크런치 460g']
  ],
  'BC-2': [
    ['1F-BC2-18-1', 'M00000404718', '[서울우유] 나 100% 우유 2.3L 오리지널'],
    ['1F-BC2-19-1', 'M00000860694', '[아카페라] 심플리 디카페인 아메리카노 (400mL X 6개)'],
    ['1F-BC2-20-1', 'MK0000100808', '[오뚜기] 오동통면 5입 (다시마2ea)'],
    ['1F-BC2-21-1', 'M00000566463', '[코다노] 트리플 슈레드 피자치즈 1kg']
  ],
  'BD-1': [
    ['1F-BD1-28-1', 'M00000233040', '[그릭데이] 플레인 1.8L'],
    ['1F-BD1-29-1', 'MK0000061306', '[오뚜기] 진라면 매운맛 5입'],
    ['1F-BD1-30-1', 'MK0000133941', '[조선호텔] 삼계탕 900g'],
    ['1F-BD1-31-1', 'MK0000062739', '[15][KF365] 고소한 파래도시락김 4g*16P'],
    ['1F-BD1-32-1', 'MK0000049727', '[서울우유] 나 100% 우유 1.8L']
  ],
  'BD-2': [
    ['1F-BD2-20-1', 'M00000102645', '[남양] 맛있는 우유 GT (900mL x 2입)'],
    ['1F-BD2-21-1', 'M00000241620', '[이스트밸리] 목초먹은 우유로 만든 모짜렐라 피자치즈 240g'],
    ['1F-BD2-22-1', 'MK0000072582', "Kurly's 샌드위치용 달걀듬뿍 샐러드 500g"],
    ['1F-BD2-23-1', 'MK0000141965', '[매일] 어메이징 오트 바리스타 950mL'],
    ['1F-BD2-24-1', 'MK0000071454', '[돈시몬] 오렌지 주스 2L']
  ]
};

test('2026-07-19 멀티밴더 원본의 23개 행과 모든 열을 보존한다', () => {
  assert.equal(displayConfig.lastUpdated, '2026-07-19');
  assert.deepEqual(
    displayConfig.multivendorProducts.map((product) => [
      product.productCode,
      product.productName,
      product.supplyCount,
      product.totalInbound,
      product.replenishment,
      product.mAdditional
    ]),
    expectedMultivendorRows
  );
});

test('2026-07-19 대량 지번 원본의 빈 지번 제외 위치·코드·상품명이 일치한다', () => {
  assert.deepEqual(Object.keys(displayConfig.rackProductCatalog), Object.keys(expectedBulkRows));
  for (const [zoneKey, expectedRows] of Object.entries(expectedBulkRows)) {
    const actualRows = Object.values(displayConfig.rackProductCatalog[zoneKey].products)
      .map((product) => [product.location, product.productCode, product.productName]);
    assert.deepEqual(actualRows, expectedRows, `${zoneKey} 데이터가 원본과 일치해야 합니다.`);
  }
});

test('멀티와 멀티밴더 검색어를 인덱스에 포함하고 항목별 키로 중복 상품을 구분한다', () => {
  const indexBuilder = indexHtml.match(/function rebuildInventoryIndex\(\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(indexBuilder, /multivendorProducts/);
  assert.match(indexBuilder, /'멀티'/);
  assert.match(indexBuilder, /'멀티밴더'/);
  assert.match(indexBuilder, /itemKey: `multivendor:\$\{product\.productCode\}`/);
  assert.match(indexHtml, /inventoryItemByKey = new Map\(inventoryItems\.map/);
});

test('멀티밴더 목록은 총 입고량과 보충 여부를 강조 표시한다', () => {
  assert.match(indexHtml, /className = 'inventory-item-highlight'/);
  assert.match(indexHtml, /`총 입고량 \$\{Number\(item\.totalInbound\)/);
  assert.match(indexHtml, /`보충 여부: \$\{needsReplenishment/);
  assert.match(indexHtml, /replenishment\.dataset\.state = needsReplenishment \? 'replenish' : 'check'/);
  assert.match(indexHtml, /inventory-item-highlight\.replenishment\[data-state="replenish"\]/);
  assert.match(indexHtml, /inventory-item-highlight\.replenishment\[data-state="check"\]/);
});

test('멀티밴더 연속 스캔은 입고·보충·공급·M 추가 정보를 강조 표시한다', () => {
  const getMultivendorScanDetails = new Function(`
    ${extractFunction('getMultivendorScanDetails')}
    return getMultivendorScanDetails;
  `)();

  assert.deepEqual(
    getMultivendorScanDetails({
      locationMode: 'temporary',
      totalInbound: 1540,
      replenishment: '보충',
      supplyCount: 3,
      mAdditional: true
    }),
    {
      totalInbound: '1,540',
      replenishment: '보충',
      replenishmentState: 'replenish',
      supplyCount: '3개',
      mAdditional: '있음'
    }
  );
  assert.equal(getMultivendorScanDetails({ locationMode: 'rack' }), null);
  assert.match(indexHtml, /id="continuous-scan-details"[^>]*aria-label="멀티밴더 입고 정보"[^>]*hidden/);
  assert.match(indexHtml, /<dt class="continuous-scan-detail-label">총 입고 수량<\/dt>/);
  assert.match(indexHtml, /<dt class="continuous-scan-detail-label">보충 여부<\/dt>/);
  assert.match(indexHtml, /detailsPanel\.hidden = isBookmark \|\| !multivendorDetails/);
  assert.match(indexHtml, /continuous-scan-detail\.primary \{[^}]*border-width: 2px/);
  assert.match(indexHtml, /continuous-scan-detail\.replenishment\[data-state="replenish"\]/);
  assert.match(indexHtml, /continuous-scan-detail\.replenishment\[data-state="check"\]/);
});

test('멀티밴더 선택은 제품 QR과 함께 임시지번을 적용한다', () => {
  const applyItem = indexHtml.match(/function applyInventoryItem\(item\) \{([\s\S]*?)\n    \}/)?.[1] || '';
  assert.match(applyItem, /item\.locationMode === 'temporary'/);
  assert.match(applyItem, /groupDefaults\.TEMP_LOT/);
  assert.match(applyItem, /zoneGroup'\)\.value = 'TEMP_LOT'/);
  assert.match(applyItem, /applyDefaultsByGroup\(true\)/);
  assert.match(applyItem, /renderLocationPreview\(\)/);
});
