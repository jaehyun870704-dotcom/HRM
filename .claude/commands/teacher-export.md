---
description: 성적 데이터 내보내기 — 전체 학생 성적을 CSV 또는 JSON으로 다운로드하는 기능을 구현합니다.
---

# Teacher Export

전체 학생의 성적 데이터를 **CSV / JSON** 파일로 내보내는 기능을 구현합니다.

## 수행 순서

### 1단계: 현재 소스 파악

아래 파일을 읽는다.
- `hrm-quiz/src/types/index.ts` — `RankRecord` 타입 확인
- `hrm-quiz/src/components/` — 기존 TeacherOverview 등 선생님 모드 컴포넌트 파악
- `hrm-quiz/src/App.tsx` — 컴포넌트 연결 방식 확인

### 2단계: 구현 상태 진단

```
기능                              상태
────────────────────────────────────────────────────
CSV 다운로드 버튼                 ✅ 구현 / ❌ 미구현
JSON 다운로드 버튼                ✅ / ❌
파일명에 날짜 포함                ✅ / ❌
빈 데이터 시 버튼 비활성화         ✅ / ❌
```

### 3단계: 내보내기 기능 구현

미구현 항목이 있으면 아래 규격으로 구현하세요.

#### 유틸 함수: `exportUtils.ts`

`hrm-quiz/src/utils/exportUtils.ts` 신규 생성:

```ts
// CSV 변환
export function recordsToCsv(records: RankRecord[]): string
// 헤더: 이름,점수,총문제,등급,소요시간(초),응시일시

// Blob 다운로드 트리거
export function downloadFile(content: string, filename: string, mimeType: string): void
// mimeType: 'text/csv' 또는 'application/json'
```

#### 파일명 규칙
- CSV: `hrm-quiz-성적_YYYY-MM-DD.csv`
- JSON: `hrm-quiz-성적_YYYY-MM-DD.json`
- 날짜는 `new Date().toISOString().slice(0, 10)` 사용

#### CSV 형식 (예시)
```
이름,점수,총문제,등급,소요시간(초),응시일시
홍길동,18,20,S,201,2026-03-30T10:00:00.000Z
김철수,14,20,B,310,2026-03-30T10:05:00.000Z
```

#### UI 연동

기존 `TeacherOverview.tsx` (또는 선생님 모드 레이아웃)에 버튼 추가:
```
[ CSV 내보내기 ]  [ JSON 내보내기 ]
```
- 데이터 0건 시 두 버튼 `disabled` + 회색 처리
- 다운로드 성공 시 버튼 텍스트 잠시 "✅ 저장됨"으로 변경 후 원복

### 4단계: 구현 후 검증

- `npx tsc --noEmit` 타입 오류 없음
- CSV 열기 시 한글 깨짐 없음 (UTF-8 BOM 처리: `\uFEFF` prefix)
- JSON 다운로드 시 `JSON.stringify(records, null, 2)` 형식 확인
