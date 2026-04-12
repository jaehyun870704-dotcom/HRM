# Quiz Check

`hrm-quiz/src/data/questions.ts`의 모든 문제 정답 정확성을 검증합니다.

## 수행 순서

### 1단계: 파일 읽기

`hrm-quiz/src/data/questions.ts`와 `hrm-quiz/src/types/index.ts`를 읽는다.

> **기출문제 보기·정답 대조 필요 시** `pdftotext` 사용:
> - `pdftotext "D:/vibecoding/practice/제40회_HRM전문가 문제지.pdf" -`
> - `pdftotext "D:/vibecoding/practice/제41회_HRM전문가 문제지.pdf" -`
>
> **알려진 주의 사항 (id=9, 제41회 38번)**
> 나 항목 빈칸 "근로기준법 제___조"는 제53조 제1항이 참조하는 **제50조** (법정근로시간)이며,
> 합산 = 280, 정답 ② 280. 연장을 허용하는 조항은 제53조 제1항임을 wrongExplanation에서 설명.

### 2단계: 정답 정확성 검증

각 문제에 대해 아래 항목을 확인하세요.

#### 2-1. answer 범위 검증
- `answer`가 `0 | 1 | 2 | 3` 범위를 벗어나면 오류

#### 2-2. 정답-보기 정합성 검증
- `options[answer]`가 존재하고 빈 문자열이 아닌지 확인
- `options[answer]`의 내용이 `explanation`에서 언급되거나 설명과 논리적으로 일치하는지 확인
  - 예: explanation에 "①번이 오답"이라고 명시돼 있는데 `answer: 0`이면 경고

#### 2-3. 오답 포인트 정합성 검증
- `wrongExplanation`이 정답 보기(`options[answer]`)가 아닌 나머지 보기들을 다루는지 확인
- `wrongExplanation`이 `explanation`과 명백히 모순되면 경고

#### 2-4. 정답 분포 편중 검사
- 전체 문제 중 동일 `answer` 값이 40% 이상이면 경고

### 3단계: 문제별 결과 출력

```
[id=N] ✅ 정상  |  정답: ② options[answer] 첫 15자...
[id=N] ⚠️ 경고  |  사유: explanation과 answer 불일치 의심
[id=N] ❌ 오류  |  사유: answer=4 (범위 초과)
```

### 4단계: 최종 요약

```
총 검증 문제 수: N
✅ 정상: N
⚠️ 경고: N  (사람이 직접 확인 필요)
❌ 오류: N

정답 분포:
  ① N문제 (XX%)
  ② N문제 (XX%)
  ③ N문제 (XX%)
  ④ N문제 (XX%)
  (편중 경고가 있으면 해당 항목에 ⚠️ 표시)
```

오류가 0건이면 마지막에 `✅ 모든 문제의 정답이 유효합니다.` 를 출력하세요.
