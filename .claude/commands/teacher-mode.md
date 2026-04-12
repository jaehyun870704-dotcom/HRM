---
description: 선생님 모드 통합 — teacher-overview / teacher-compare / teacher-grade-dist / teacher-export 를 순서대로 실행해 선생님 모드 전체를 한 번에 구현합니다.
---

# Teacher Mode (통합 명령어)

선생님 모드에 필요한 모든 기능을 **순서대로** 구현합니다.
내부적으로 아래 4개 명령을 순차 실행합니다.

```
1. /teacher-overview    — 성적 현황판 (학생 목록 + 핵심 통계)
2. /teacher-compare     — 학생 성적 비교 뷰
3. /teacher-grade-dist  — 등급 분포 분석 차트
4. /teacher-export      — CSV / JSON 내보내기
```

## 수행 순서

### 0단계: 사전 확인

아래 파일을 읽어 현재 선생님 모드 구현 여부를 빠르게 점검한다.
- `hrm-quiz/src/App.tsx`
- `hrm-quiz/src/types/index.ts`
- `hrm-quiz/src/components/` 전체 파일 목록

점검 결과를 한 줄로 요약한 뒤 구현을 시작하세요:
```
현재 상태: 선생님 모드 미구현 — 4개 기능 모두 신규 구현 예정
```
또는
```
현재 상태: TeacherOverview ✅ / TeacherCompare ❌ / GradeDist ❌ / Export ❌ — 3개 기능 추가 구현 예정
```

### 1단계: 성적 현황판 구현 (`/teacher-overview`)

`teacher-overview.md` 의 전체 수행 순서를 그대로 실행하세요.
완료 후 "✅ 1/4 teacher-overview 완료" 를 출력하세요.

### 2단계: 학생 비교 뷰 구현 (`/teacher-compare`)

`teacher-compare.md` 의 전체 수행 순서를 그대로 실행하세요.
완료 후 "✅ 2/4 teacher-compare 완료" 를 출력하세요.

### 3단계: 등급 분포 구현 (`/teacher-grade-dist`)

`teacher-grade-dist.md` 의 전체 수행 순서를 그대로 실행하세요.
완료 후 "✅ 3/4 teacher-grade-dist 완료" 를 출력하세요.

### 4단계: 내보내기 구현 (`/teacher-export`)

`teacher-export.md` 의 전체 수행 순서를 그대로 실행하세요.
완료 후 "✅ 4/4 teacher-export 완료" 를 출력하세요.

### 5단계: 최종 통합 검증

모든 기능 구현 후 아래를 순서대로 실행하세요.

1. `npx tsc --noEmit` — 타입 오류 없음 확인
2. `npm run lint` — ESLint 경고·오류 없음 확인

검증 결과를 아래 형식으로 출력하세요:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  선생님 모드 구현 완료 보고
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ teacher-overview   — 성적 현황판
  ✅ teacher-compare    — 학생 성적 비교
  ✅ teacher-grade-dist — 등급 분포 분석
  ✅ teacher-export     — 성적 내보내기

  신규 파일:
    src/components/TeacherOverview.tsx
    src/components/TeacherCompare.tsx
    src/components/TeacherGradeDist.tsx
    src/utils/exportUtils.ts

  수정 파일:
    src/App.tsx      — phase 'teacher' 추가, 라우팅 연결
    src/types/index.ts — (변경 시)

  타입 검사: ✅ 통과
  린트:      ✅ 통과
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

오류가 있으면 해당 단계로 돌아가 수정한 뒤 재검증하세요.
