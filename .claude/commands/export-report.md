---
description: 보고서 내보내기 — teacher_report.html을 읽어 CSV 또는 PDF 파일로 저장합니다.
---

# Export Report

`teacher_report.html` 파일을 읽어 **CSV** 또는 **PDF** 형식으로 내보냅니다.

## 수행 순서

### 1단계: teacher_report.html 존재 여부 확인

`hrm-quiz/teacher_report.html` 파일이 존재하는지 확인합니다.

- 파일이 없으면 아래 메시지를 출력하고 중단합니다:
  ```
  ⚠️ teacher_report.html 파일을 찾을 수 없습니다.
  선생님 대시보드에서 보고서를 먼저 생성하거나,
  /create-report 명령으로 보고서를 생성해 주세요.
  ```

### 2단계: 내보내기 형식 선택

사용자에게 질문합니다:

> "어떤 형식으로 내보낼까요?
> 1. CSV — 엑셀에서 바로 열 수 있는 표 형식
> 2. PDF — 인쇄·공유에 적합한 문서 형식
> 3. 둘 다"

### 3단계: HTML 파싱 및 데이터 추출

`teacher_report.html`을 읽고 아래 데이터를 추출합니다.

추출 대상:
- 보고서 제목 및 기준일
- 요약 통계 (총 응시자, 평균 점수, 최고/최저 점수)
- 등급 분포 테이블 (등급, 기준, 인원, 비율)
- 개인별 성적 테이블 (순위, 이름, 점수, 백분위, 등급, 소요시간)

HTML에서 테이블 데이터를 파싱할 때:
- `<table>` 태그의 `<tr>`, `<th>`, `<td>` 기준으로 추출
- 헤더 행은 건너뛰고 데이터 행만 수집
- 셀 내 공백·줄바꿈은 trim() 처리

### 4단계-A: CSV 내보내기

선택 시 `hrm-quiz/src/utils/exportUtils.ts` 의 `downloadFile` · `todayStr` 유틸을 활용합니다.

파일명: `teacher_report_YYYY-MM-DD.csv`

CSV 구성 (섹션 구분):
```
[요약]
총 응시자,평균 점수,최고 점수,최저 점수
N명,N.N,N점 ({이름}),N점 ({이름})

[등급 분포]
등급,기준,인원,비율
A,상위 20%,N명,XX%
B,상위 21~40%,N명,XX%
C,상위 41~70%,N명,XX%
D,하위 30%,N명,XX%

[개인별 성적]
순위,이름,점수,백분위,등급,소요시간
1,{이름},N/20,상위N%,A,mm:ss
...
```

- 한글 깨짐 방지: UTF-8 BOM(`\uFEFF`) 파일 앞에 추가
- `exportUtils.ts`가 없으면 브라우저 `Blob` + `<a>` 태그 방식으로 직접 구현

#### TeacherDashboard에 버튼 추가

`hrm-quiz/src/components/TeacherDashboard.tsx` 의 내보내기 버튼 영역에 추가:
```tsx
<button
  onClick={handleCsvReportExport}
  disabled={!reportAvailable}
  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
>
  <Download size={13} />
  보고서 CSV
</button>
```

### 4단계-B: PDF 내보내기

선택 시 브라우저 내장 `window.print()` 방식을 활용합니다 (외부 라이브러리 사용 금지).

구현 방법:
1. `teacher_report.html` 내용을 새 창(`window.open`)으로 열기
2. `<head>` 에 아래 print 전용 스타일을 주입:
   ```html
   <style media="print">
     body { font-family: 'Malgun Gothic', sans-serif; font-size: 11pt; }
     table { border-collapse: collapse; width: 100%; }
     th, td { border: 1px solid #ccc; padding: 6px 10px; }
     thead { background: #f3f4f6; }
     @page { margin: 20mm; }
   </style>
   ```
3. `window.print()` 호출 → 브라우저 인쇄 다이얼로그에서 "PDF로 저장" 안내

파일명 안내: `teacher_report_YYYY-MM-DD.pdf` (사용자가 인쇄 다이얼로그에서 직접 지정)

#### TeacherDashboard에 버튼 추가

```tsx
<button
  onClick={handlePdfReportExport}
  disabled={!reportAvailable}
  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
>
  <Download size={13} />
  보고서 PDF
</button>
```

### 5단계: 검증

구현 완료 후 아래를 실행합니다.

```bash
npx tsc --noEmit
npm run lint
```

오류가 있으면 수정 후 재실행.

완료 시 아래 메시지를 출력합니다:
```
✅ export-report 완료
  - CSV 내보내기: TeacherDashboard "보고서 CSV" 버튼 추가됨
  - PDF 내보내기: TeacherDashboard "보고서 PDF" 버튼 추가됨
  - 파일 읽기 대상: hrm-quiz/teacher_report.html
```
