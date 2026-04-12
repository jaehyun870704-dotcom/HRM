# HRM전문가 퀴즈

한국공인노무사회 HRM전문가 역량인증 시험 대비 퀴즈 게임입니다. 기출문제(제40·41회)와 핵심 이론 문제 20개로 구성되며, 즉시 피드백과 오답 복습 기능을 제공합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 | Vite 6 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 아이콘 | lucide-react |

## 설치 및 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 게임 규칙

1. 이름을 입력하고 시작
2. 총 20문제가 무작위 순서로 출제 (HRM실무 10문제 + 근로관계법 10문제)
3. 보기를 선택하면 즉시 정답 여부와 해설을 확인할 수 있음
4. 오답 시 오답 포인트 별도 표시
5. 모든 문제를 풀면 결과 화면으로 이동
6. 키보드 `1`~`4`: 보기 선택 / `Enter` 또는 `Space`: 다음 문제

### 등급 기준

| 등급 | 점수 | 의미 |
|------|------|------|
| **S** | 18~20점 | HRM 전문가 |
| **A** | 15~17점 | 우수 |
| **B** | 12~14점 | 양호 |
| **C** | 9~11점  | 보통 |
| **D** | 0~8점   | 기초 학습 필요 |

## 문제 출처

- **기출문제**: 한국공인노무사회 HRM전문가 역량인증 제40회 · 제41회
- **이론문제**: HRM실무 및 근로관계법 핵심 이론 (HRM실무 4문제 + 근로관계법 4문제)

## 폴더 구조

```
src/
├── data/
│   └── questions.ts      # 20문제 데이터 (기출 12 + 이론 8)
├── types/
│   └── index.ts          # Question, QuizState, RankRecord 등 공유 타입
├── hooks/
│   └── useQuiz.ts        # useReducer 기반 게임 로직 전체
├── components/
│   ├── StartScreen.tsx   # 이름 입력 + 순위표
│   ├── ProgressBar.tsx   # 진행률 + 타이머 (sticky)
│   ├── QuestionCard.tsx  # 문제 본문 + 보기 4개 + 정답 confetti
│   ├── FeedbackPanel.tsx # 정답/오답 해설 (slide-in, role="alert")
│   ├── NextButton.tsx    # 다음 문제 / 결과 확인 (fixed bottom)
│   └── ResultScreen.tsx  # 점수·등급·과목별 성적·오답 복습·순위표
└── App.tsx               # phase 분기 조립 + 키보드 내비게이션
```
