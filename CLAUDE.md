# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`hrm-quiz/` — HRM 전문가 퀴즈 게임 (Vite + React + TypeScript + Tailwind CSS v4)

## Commands

```bash
cd hrm-quiz
npm run dev      # dev server
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type check only
```

## Architecture

```
src/
├── data/questions.ts   # Question[] 배열 (20문제: HRM실무 10 + 근로관계법 10)
├── types/index.ts      # Question, RankRecord, Category, Difficulty, Source, ExamRound
├── components/         # UI 컴포넌트
├── hooks/              # 커스텀 훅
└── App.tsx
```

### Key types (`src/types/index.ts`)

- `Question.answer` — 0-index (0~3)
- `Question.exam` — `'제40회' | '제41회' | null` (이론 문제는 null)
- `Question.source` — `'기출' | '이론'`
- `RankRecord` — 랭킹 저장용 (localStorage 등에 활용 예정)

### Tailwind v4

`@tailwindcss/vite` 플러그인 방식 사용. `vite.config.ts`에 플러그인 등록, `index.css`에 `@import "tailwindcss"` 한 줄로 설정 완료. 별도 `tailwind.config.js` 없음.

퀴즈 문제 교차 검증 가이드라인

모든 문제 작성 시 확인사항
1. 첨부된 제41회_HRM전문가 문제지와 동일한 문제를 출제하는가?
- 기출문제는 문제와 보기 모두 동일하게 출제 

2. 첨부된 제41회_HRM전문가 문제지 동일한 문제가 아닌 경우, HRM전문가 책을 기준으로 하는 문제를 출제 하는가?
- HRM 전문가 책을 토대로 문제를 만들어

3. 첫 화면에 친밀관계법이 아니라 근로관계법으로 수정
- 총 20문제 · HRM실무 + 근로관계법

4. 정답이 하나뿐인가?
- 중복인 경우 2개를 체크하라고 안내해

5. 문제의 난이도를 쉬움, 보통, 어려움 3단계로 구분해

6. 문제를 풀고 난 후, 다음문제로 넘어갈 수 있게 버튼을 생성해

