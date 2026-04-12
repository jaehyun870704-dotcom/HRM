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

function fmtTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function generateReportHtml(records: RankRecord[]): string {
  const total = records.length;
  const avg = total ? (records.reduce((s, r) => s + r.score, 0) / total).toFixed(1) : '-';
  const sorted = [...records].sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.elapsedSeconds - b.elapsedSeconds
  );
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const passCount = records.filter(r => r.grade === 'S' || r.grade === 'A').length;
  const passRate = total ? Math.round((passCount / total) * 100) : 0;

  const gradeCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  records.forEach(r => { gradeCounts[r.grade] = (gradeCounts[r.grade] ?? 0) + 1; });

  const gradeRows = (['S', 'A', 'B', 'C', 'D'] as const).map(g => {
    const cnt = gradeCounts[g] ?? 0;
    const pct = total ? Math.round((cnt / total) * 100) : 0;
    const label: Record<string, string> = {
      S: '상위 10%', A: '상위 11~30%', B: '상위 31~60%', C: '상위 61~80%', D: '하위 20%',
    };
    return `<tr><td>${g}</td><td>${label[g]}</td><td>${cnt}명</td><td>${pct}%</td></tr>`;
  }).join('');

  const studentRows = sorted.map((r, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${r.name}</td>
      <td>${r.score} / ${r.total}</td>
      <td>${r.grade}</td>
      <td>${fmtTime(r.elapsedSeconds)}</td>
      <td>${fmtDate(r.playedAt)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>HRM 퀴즈 성적 보고서</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; font-size: 11pt; color: #1f2937; padding: 24px 32px; }
    h1 { font-size: 18pt; font-weight: bold; margin-bottom: 4px; }
    .sub { font-size: 10pt; color: #6b7280; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; }
    .card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .card .label { font-size: 9pt; color: #6b7280; margin-bottom: 4px; }
    .card .value { font-size: 16pt; font-weight: bold; }
    h2 { font-size: 12pt; font-weight: bold; margin: 20px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    th { background: #f3f4f6; text-align: left; padding: 7px 10px; border: 1px solid #e5e7eb; font-weight: 600; }
    td { padding: 6px 10px; border: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    @page { margin: 20mm; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>HRM 퀴즈 성적 보고서</h1>
  <p class="sub">생성일: ${todayStr()} &nbsp;|&nbsp; 총 응시자: ${total}명</p>

  <div class="summary">
    <div class="card"><div class="label">평균 점수</div><div class="value">${avg} <span style="font-size:10pt;font-weight:normal;color:#6b7280;">/ 20</span></div></div>
    <div class="card"><div class="label">합격률 (A 이상)</div><div class="value">${passRate}<span style="font-size:10pt;font-weight:normal;color:#6b7280;">%</span></div></div>
    <div class="card"><div class="label">최고 점수</div><div class="value">${best ? `${best.score}점 (${best.name})` : '-'}</div></div>
    <div class="card"><div class="label">최저 점수</div><div class="value">${worst ? `${worst.score}점 (${worst.name})` : '-'}</div></div>
  </div>

  <h2>등급 분포</h2>
  <table>
    <thead><tr><th>등급</th><th>기준</th><th>인원</th><th>비율</th></tr></thead>
    <tbody>${gradeRows}</tbody>
  </table>

  <h2>개인별 성적</h2>
  <table>
    <thead><tr><th>순위</th><th>이름</th><th>점수</th><th>등급</th><th>소요시간</th><th>응시일시</th></tr></thead>
    <tbody>${studentRows}</tbody>
  </table>

  <p style="margin-top:20px;font-size:9pt;color:#9ca3af;">* PDF로 저장하려면 브라우저 인쇄(Ctrl+P) → 대상: PDF로 저장</p>
</body>
</html>`;
}

export function openPrintWindow(html: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
