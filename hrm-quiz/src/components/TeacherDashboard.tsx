import { useState, useMemo } from 'react';
import { ArrowLeft, Download, Users, Award, TrendingUp } from 'lucide-react';
import type { RankRecord } from '../types';
import { recordsToCsv, downloadFile, todayStr, generateReportHtml, openPrintWindow } from '../utils/exportUtils';

interface TeacherDashboardProps {
  rankings: RankRecord[];
  onBack: () => void;
}

type SortKey = 'score' | 'elapsedSeconds' | 'name' | 'playedAt';
type SortDir = 'asc' | 'desc';

const GRADE_COLORS: Record<string, string> = {
  S: 'bg-purple-500',
  A: 'bg-blue-500',
  B: 'bg-green-500',
  C: 'bg-yellow-500',
  D: 'bg-red-500',
};

const GRADE_BADGE: Record<string, string> = {
  S: 'bg-purple-100 text-purple-800',
  A: 'bg-blue-100 text-blue-800',
  B: 'bg-green-100 text-green-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800',
};

function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 동일 이름 중 점수 최고 기록 1건만 남기기 */
function deduplicateByBest(records: RankRecord[]): RankRecord[] {
  const map = new Map<string, RankRecord>();
  for (const r of records) {
    const existing = map.get(r.name);
    if (!existing || r.score > existing.score || (r.score === existing.score && r.elapsedSeconds < existing.elapsedSeconds)) {
      map.set(r.name, r);
    }
  }
  return Array.from(map.values());
}

export default function TeacherDashboard({ rankings, onBack }: TeacherDashboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [csvLabel, setCsvLabel] = useState('CSV 내보내기');
  const [jsonLabel, setJsonLabel] = useState('JSON 내보내기');
  const [pdfLabel, setPdfLabel] = useState('PDF 저장');

  const students = useMemo(() => deduplicateByBest(rankings), [rankings]);

  const sorted = useMemo(() => {
    return [...students].sort((a, b) => {
      let diff = 0;
      if (sortKey === 'score') diff = a.score - b.score;
      else if (sortKey === 'elapsedSeconds') diff = a.elapsedSeconds - b.elapsedSeconds;
      else if (sortKey === 'name') diff = a.name.localeCompare(b.name);
      else if (sortKey === 'playedAt') diff = a.playedAt.localeCompare(b.playedAt);
      return sortDir === 'desc' ? -diff : diff;
    });
  }, [students, sortKey, sortDir]);

  // 요약 통계
  const avgScore = students.length
    ? (students.reduce((s, r) => s + r.score, 0) / students.length).toFixed(1)
    : '-';
  const passCount = students.filter(r => r.grade === 'S' || r.grade === 'A').length;
  const passRate = students.length ? Math.round((passCount / students.length) * 100) : 0;

  // 등급 분포
  const gradeDist = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    students.forEach(r => { counts[r.grade] = (counts[r.grade] ?? 0) + 1; });
    return counts;
  }, [students]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); }
      else if (next.size < 5) { next.add(name); }
      return next;
    });
  };

  const compareStudents = sorted.filter(r => selected.has(r.name));

  // 비교 테이블에서 최고/최저 판별
  const maxScore = compareStudents.length ? Math.max(...compareStudents.map(r => r.score)) : -1;
  const minScore = compareStudents.length ? Math.min(...compareStudents.map(r => r.score)) : Infinity;
  const minTime = compareStudents.length ? Math.min(...compareStudents.map(r => r.elapsedSeconds)) : Infinity;
  const maxTime = compareStudents.length ? Math.max(...compareStudents.map(r => r.elapsedSeconds)) : -1;

  const handleCsvExport = () => {
    downloadFile(recordsToCsv(students), `hrm-quiz-성적_${todayStr()}.csv`, 'text/csv');
    setCsvLabel('✅ 저장됨');
    setTimeout(() => setCsvLabel('CSV 내보내기'), 1500);
  };

  const handleJsonExport = () => {
    downloadFile(JSON.stringify(students, null, 2), `hrm-quiz-성적_${todayStr()}.json`, 'application/json');
    setJsonLabel('✅ 저장됨');
    setTimeout(() => setJsonLabel('JSON 내보내기'), 1500);
  };

  const handlePdfExport = () => {
    const html = generateReportHtml(students);
    openPrintWindow(html);
    setPdfLabel('✅ 열림');
    setTimeout(() => setPdfLabel('PDF 저장'), 1500);
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : '';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition"
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
          <h1 className="text-xl font-bold text-gray-800">선생님 대시보드</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCsvExport}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} />
            {csvLabel}
          </button>
          <button
            onClick={handleJsonExport}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} />
            {jsonLabel}
          </button>
          <button
            onClick={handlePdfExport}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={13} />
            {pdfLabel}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Users size={48} className="mb-4 opacity-30" />
          <p className="text-base font-medium">아직 응시자가 없습니다.</p>
          <p className="text-sm mt-1">학생들이 퀴즈를 완료하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* 요약 카드 3개 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Users size={13} />
                총 응시자
              </div>
              <p className="text-2xl font-bold text-gray-800">{students.length}<span className="text-sm font-normal text-gray-400 ml-1">명</span></p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <TrendingUp size={13} />
                평균 점수
              </div>
              <p className="text-2xl font-bold text-gray-800">{avgScore}<span className="text-sm font-normal text-gray-400 ml-1">/ 20</span></p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Award size={13} />
                합격률 (A↑)
              </div>
              <p className="text-2xl font-bold text-gray-800">{passRate}<span className="text-sm font-normal text-gray-400 ml-1">%</span></p>
              <p className="text-xs text-gray-400">{passCount}명 합격</p>
            </div>
          </div>

          {/* 등급 분포 */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">등급 분포</h2>
            <div className="flex flex-col gap-2">
              {(['S', 'A', 'B', 'C', 'D'] as const).map(grade => {
                const count = gradeDist[grade] ?? 0;
                const pct = students.length ? Math.round((count / students.length) * 100) : 0;
                return (
                  <div key={grade} className="flex items-center gap-2 text-sm">
                    <span className={`w-6 text-center text-xs font-bold rounded px-1 py-0.5 ${GRADE_BADGE[grade]}`}>{grade}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${GRADE_COLORS[grade]}`}
                        style={{ width: pct > 0 ? `${pct}%` : '2px' }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs w-16 text-right">{count}명 ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 학생 성적표 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">학생 성적표</h2>
              {selected.size >= 2 && (
                <span className="text-xs text-blue-600">{selected.size}명 선택됨 — 아래에서 비교</span>
              )}
              {selected.size === 1 && (
                <span className="text-xs text-gray-400">1명 더 선택하면 비교 가능</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs">
                    <th className="py-2 px-3 w-8"></th>
                    <th className="py-2 px-3 text-left">
                      <button onClick={() => handleSort('name')} className="hover:text-gray-700 transition">
                        이름{sortIcon('name')}
                      </button>
                    </th>
                    <th className="py-2 px-3 text-center">
                      <button onClick={() => handleSort('score')} className="hover:text-gray-700 transition">
                        점수{sortIcon('score')}
                      </button>
                    </th>
                    <th className="py-2 px-3 text-center">등급</th>
                    <th className="py-2 px-3 text-center">
                      <button onClick={() => handleSort('elapsedSeconds')} className="hover:text-gray-700 transition">
                        시간{sortIcon('elapsedSeconds')}
                      </button>
                    </th>
                    <th className="py-2 px-3 text-right">
                      <button onClick={() => handleSort('playedAt')} className="hover:text-gray-700 transition">
                        응시일{sortIcon('playedAt')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r, i) => (
                    <tr
                      key={r.name}
                      className={`border-b border-gray-50 last:border-0 transition ${selected.has(r.name) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.name)}
                          onChange={() => toggleSelect(r.name)}
                          disabled={!selected.has(r.name) && selected.size >= 5}
                          className="rounded"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800">
                        {i === 0 && sortKey === 'score' && sortDir === 'desc' && (
                          <span className="mr-1 text-yellow-500">👑</span>
                        )}
                        {r.name}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-gray-800">
                        {r.score}<span className="text-gray-400 font-normal text-xs">/{r.total}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${GRADE_BADGE[r.grade] ?? 'bg-gray-100 text-gray-700'}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-gray-500 tabular-nums text-xs">{formatTime(r.elapsedSeconds)}</td>
                      <td className="py-2 px-3 text-right text-gray-400 text-xs">{formatDate(r.playedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 비교 테이블 */}
          {compareStudents.length >= 2 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">학생 비교</h2>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-gray-400 hover:text-gray-700 transition"
                >
                  선택 초기화
                </button>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-gray-100">
                      <th className="py-2 pr-4 text-left">항목</th>
                      {compareStudents.map(r => (
                        <th key={r.name} className="py-2 px-3 text-center font-medium text-gray-700">{r.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 점수 행 */}
                    <tr className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-500 text-xs">점수</td>
                      {compareStudents.map(r => (
                        <td
                          key={r.name}
                          className={`py-2 px-3 text-center font-bold ${r.score === maxScore && maxScore !== minScore ? 'bg-green-50 text-green-700' : r.score === minScore && maxScore !== minScore ? 'bg-red-50 text-red-600' : 'text-gray-800'}`}
                        >
                          {r.score}/{r.total}
                        </td>
                      ))}
                    </tr>
                    {/* 등급 행 */}
                    <tr className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-500 text-xs">등급</td>
                      {compareStudents.map(r => (
                        <td key={r.name} className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${GRADE_BADGE[r.grade] ?? 'bg-gray-100 text-gray-700'}`}>
                            {r.grade}
                          </span>
                        </td>
                      ))}
                    </tr>
                    {/* 시간 행 */}
                    <tr className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-500 text-xs">소요시간</td>
                      {compareStudents.map(r => (
                        <td
                          key={r.name}
                          className={`py-2 px-3 text-center tabular-nums text-xs ${r.elapsedSeconds === minTime && minTime !== maxTime ? 'bg-green-50 text-green-700 font-bold' : r.elapsedSeconds === maxTime && minTime !== maxTime ? 'bg-red-50 text-red-600' : 'text-gray-800'}`}
                        >
                          {formatTime(r.elapsedSeconds)}
                        </td>
                      ))}
                    </tr>
                    {/* 순위 행 */}
                    <tr>
                      <td className="py-2 pr-4 text-gray-500 text-xs">전체 순위</td>
                      {compareStudents.map(r => {
                        const rank = sorted.findIndex(s => s.name === r.name) + 1;
                        return (
                          <td key={r.name} className="py-2 px-3 text-center text-gray-700 text-xs">
                            {rank}위 / {students.length}명
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-2">
                  <span className="inline-block w-3 h-3 bg-green-100 rounded mr-1 align-middle" />최고값
                  <span className="inline-block w-3 h-3 bg-red-50 rounded ml-3 mr-1 align-middle" />최저값
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
