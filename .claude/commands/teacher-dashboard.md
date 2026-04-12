---
description: 선생님 대시보드 — 성적 현황·비교·등급 분포·내보내기를 하나의 화면에 통합한 대시보드를 구현합니다.
---

# Teacher Dashboard

선생님 모드의 모든 기능(성적 현황·학생 비교·등급 분포·데이터 내보내기)을 **단일 화면 대시보드**로 구현합니다.

## 수행 순서

### 1단계: 현재 소스 파악

아래 파일을 읽는다.
- `hrm-quiz/src/types/index.ts`
- `hrm-quiz/src/hooks/useQuiz.ts`
- `hrm-quiz/src/App.tsx`
- `hrm-quiz/src/components/StartScreen.tsx`

### 2단계: 필요한 변경 범위 정리

읽은 내용을 바탕으로 아래를 출력하세요.

```
변경 파일:
  src/types/index.ts        — QuizState.phase 에 'teacher' 추가
  src/hooks/useQuiz.ts      — goToTeacher / backFromTeacher 액션 추가
  src/components/StartScreen.tsx  — "선생님 모드" 버튼 추가
  src/App.tsx               — phase === 'teacher' 분기 추가

신규 파일:
  src/components/TeacherDashboard.tsx
  src/utils/exportUtils.ts
```

### 3단계: 타입 및 훅 수정

#### `src/types/index.ts`
`QuizState.phase` 에 `'teacher'` 추가:
```ts
phase: 'start' | 'playing' | 'result' | 'teacher';
```

#### `src/hooks/useQuiz.ts`
액션 타입에 추가:
```ts
| { type: 'GO_TEACHER' }
| { type: 'BACK_FROM_TEACHER' }
```
리듀서에 케이스 추가:
```ts
case 'GO_TEACHER':
  return { ...state, phase: 'teacher' };
case 'BACK_FROM_TEACHER':
  return { ...state, phase: 'start' };
```
훅 반환값에 추가:
```ts
const goToTeacher = useCallback(() => dispatch({ type: 'GO_TEACHER' }), []);
const backFromTeacher = useCallback(() => dispatch({ type: 'BACK_FROM_TEACHER' }), []);
```

### 4단계: 내보내기 유틸 구현

`src/utils/exportUtils.ts` 신규 생성:

```ts
import type { RankRecord } from '../types';

export function recordsToCsv(records: RankRecord[]): string {
  const header = '이름,점수,총문제,등급,소요시간(초),응시일시';
  const rows = records.map(r =>
    [r.name, r.score, r.total, r.grade, r.elapsedSeconds, r.playedAt].join(',')
  );
  return '\uFEFF' + [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
```

### 5단계: TeacherDashboard 컴포넌트 구현

`src/components/TeacherDashboard.tsx` 신규 생성.

**레이아웃 구조**
```
┌─────────────────────────────────────────┐
│  선생님 대시보드              [← 돌아가기] │
├───────────┬────────────────┬────────────┤
│ 총 응시자  │   평균 점수     │  합격률     │
│   N명      │  N.N / 20     │   XX%      │
├───────────┴────────────────┴────────────┤
│  등급 분포 막대 차트 (S/A/B/C/D)         │
├─────────────────────────────────────────┤
│  학생 성적표 (정렬 가능)                  │
│  # │ 이름 │ 점수 │ 등급 │ 시간 │ 응시일   │
│  체크박스로 학생 선택 → 비교 뷰 전환       │
├─────────────────────────────────────────┤
│  [CSV 내보내기]  [JSON 내보내기]          │
└─────────────────────────────────────────┘
```

**상세 구현 규격**

요약 카드 3개 (총 응시자, 평균 점수, 합격률):
- `bg-white rounded-xl shadow-sm p-4` 스타일
- 합격 기준: grade가 S 또는 A인 경우

등급 분포 막대:
- 외부 라이브러리 없이 CSS + Tailwind 만으로 구현
- 색상: S=보라(purple-500), A=파랑(blue-500), B=초록(green-500), C=노랑(yellow-500), D=빨강(red-500)
- 막대 너비: `style={{ width: \`${pct}%\` }}` + `min-w` 처리로 0%도 표시

학생 성적표:
- 정렬: 기본값 점수 내림차순, 헤더 클릭으로 점수/시간/이름 정렬 토글
- 체크박스 2~5개 선택 시 하단에 비교 테이블 슬라이드 인
- 동일 이름 중복 응시 시 최고 기록 1건만 표시 (playedAt 기준 최신 우선이면서 score 최고)

비교 테이블 (체크박스 선택 후 표시):
- 항목: 점수, 등급, 소요시간, 순위
- 각 행에서 최고값 셀: `bg-green-50 font-bold text-green-700`
- 최저값 셀: `bg-red-50 text-red-600`

내보내기 버튼:
- 데이터 0건 시 disabled
- 클릭 후 버튼 텍스트 1.5초간 "✅ 저장됨" 으로 변경 후 원복

응시자 없음 상태:
- "아직 응시자가 없습니다. 학생들이 퀴즈를 완료하면 여기에 표시됩니다." 안내

### 6단계: StartScreen 및 App 연동

#### `src/components/StartScreen.tsx`
"시작하기" 버튼 아래에 추가:
```tsx
<button
  onClick={onTeacher}
  className="w-full border border-white/30 text-white/70 text-sm rounded-xl py-2.5 hover:bg-white/5 transition"
>
  선생님 모드
</button>
```
props에 `onTeacher: () => void` 추가.

#### `src/App.tsx`
- `TeacherDashboard` import 추가
- `goToTeacher`, `backFromTeacher` useQuiz에서 구조분해
- `phase === 'teacher'` 분기 추가:
```tsx
if (state.phase === 'teacher') {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[900px] mx-auto min-h-screen">
        <TeacherDashboard rankings={state.rankings} onBack={backFromTeacher} />
      </div>
    </div>
  );
}
```
- StartScreen에 `onTeacher={goToTeacher}` prop 전달

### 7단계: 보고서 내보내기 연동

대시보드 구현이 완료된 후 `/export-report` 명령을 실행해 CSV·PDF 내보내기 기능을 추가합니다.

`export-report.md` 의 전체 수행 순서를 그대로 실행하세요.
완료 후 "✅ export-report 연동 완료" 를 출력하세요.

### 8단계: 검증

```bash
npx tsc --noEmit
npm run lint
```

오류가 있으면 수정 후 재실행.
