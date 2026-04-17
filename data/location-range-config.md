# location-range-config.json 설명

`location-range-config.json`은 존/렉/칸 입력 UI의 범위와 고정 규칙을 관리하는 설정 파일입니다.

## 1) zoneRules
- 용도: 존 코드별 **존 번호 범위**를 정의합니다.
- 형식: `"존코드": [시작번호, 끝번호]`
- 예시: `"D": [1, 11]` → D존은 1~11 선택 가능

## 2) rackCellDefaults
- 용도: 별도 규칙이 없을 때 적용되는 기본 렉/칸 범위입니다.
- `rackRange`: 렉 번호 범위
- `cellOptions`: 칸 번호 목록

## 3) locationInputRules
- 용도: 특정 존 코드+존 번호 조합에 대한 예외 규칙입니다.
- 키 형식: `"{zoneCode}-{zoneNumber}"` (예: `"AC-2"`)
- 사용 가능한 속성:
  - `rackRange`: 해당 위치에서 허용할 렉 범위
  - `cellOptions`: 해당 위치에서 허용할 칸 목록
  - `lockCell`: 칸 입력을 잠글지 여부
  - `fixedCell`: 칸 입력을 잠글 때 강제로 사용할 칸 번호
  - `disableRack`(선택): 렉 입력 비활성화
  - `disableCell`(선택): 칸 입력 비활성화
  - `fixedRack`(선택): 렉 입력 고정값

## 4) groupInputRules
- 용도: 존 그룹 단위(`TEMP_LOT`, `H_ZONE` 등)로 입력 제어 규칙을 정의합니다.
- 사용 가능한 속성:
  - `disableRack`: 렉 입력 비활성화
  - `disableCell`: 칸 입력 비활성화
  - `lockCell`: 칸 잠금 (UI에서 disableCell과 함께 사용 가능)
  - `fixedRack`: 렉 고정값
  - `fixedCell`: 칸 고정값

## 우선순위
`index.html`의 현재 로직 기준 우선순위는 아래와 같습니다.

1. 위치 규칙(`locationInputRules`)
2. 그룹 규칙(`groupInputRules`)
3. 기본값(`rackCellDefaults`)

예를 들어 `fixedCell`은 `locationInputRules`에 있으면 해당 값이 우선 적용되고,
없으면 `groupInputRules`의 값을 사용합니다.

## 수정 시 체크리스트
1. JSON 문법 확인: `python -m json.tool data/location-range-config.json`
2. 키 이름 확인: `locationInputRules`는 반드시 `"코드-번호"` 형식
3. 고정값이 옵션 범위에 포함되는지 확인
   - `fixedRack`는 `rackRange` 안의 값인지
   - `fixedCell`은 `cellOptions` 안의 값인지
