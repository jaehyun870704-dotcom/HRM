---
description: 프로젝트 대시보드 — 퀴즈 문제 현황·성적 데이터·구현 상태를 한눈에 요약 보고합니다.
---

# Dashboard

HRM 퀴즈 프로젝트의 전체 현황을 **한 번의 명령으로** 요약합니다.
코드를 수정하지 않고 현재 상태를 읽고 보고하는 명령입니다.

## 수행 순서

### 1단계: 파일 읽기

아래 파일을 읽는다.
- `hrm-quiz/src/data/questions.ts`
- `hrm-quiz/src/types/index.ts`
- `hrm-quiz/src/hooks/useQuiz.ts`
- `hrm-quiz/src/components/` 전체 파일 목록

### 2단계: 대시보드 출력

아래 형식으로 현황을 출력하세요. 실제 값을 코드에서 읽어 채웁니다.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HRM 퀴즈 프로젝트 대시보드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 문제 현황
  총 문제 수:   N문제
  HRM실무:     N문제 (XX%)   근로관계법: N문제 (XX%)
  기출:        N문제          이론:       N문제
  난이도:      쉬움 N  보통 N  어려움 N

🏗️ 구현 현황
  phase 목록:  start | playing | result | teacher  (또는 실제 값)
  컴포넌트:    N개   (components/ 파일 수)
  선생님 모드: ✅ 구현 / ❌ 미구현   (TeacherDashboard.tsx 존재 여부)
  내보내기:   ✅ 구현 / ❌ 미구현   (exportUtils.ts 존재 여부)

📊 랭킹 시스템
  localStorage 키: 'hrm-quiz-rankings'
  최대 보관:        N개  (상위 N명)
  등급 기준:
    S: N점 이상   A: N점 이상   B: N점 이상
    C: N점 이상   D: 그 이하

⚠️ 주의 사항
  (아래 중 해당하는 항목만 출력, 없으면 '✅ 이슈 없음')
  - 총 문제 수 20 미만 → "문제 수 부족: /quiz-add 권장"
  - explanation 빈 항목 있음 → "해설 누락 N건"
  - 카테고리 비율 7:3 초과 편중 → "카테고리 불균형"
  - 선생님 모드 미구현 → "/teacher-dashboard 실행 권장"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  관련 명령어
  /quiz-add          문제 추가
  /quiz-stat         문제 통계 상세 분석
  /quiz-validate     문제 교차 검증
  /quiz-check        정답·보기 오류 점검
  /teacher-dashboard 선생님 대시보드 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
