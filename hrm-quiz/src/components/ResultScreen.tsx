import { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { QuizState } from '../types';

// ── 등급 스타일 (A/B/C/D) ────────────────────────────────────────────────

const GRADE_STYLE: Record<string, { ring: string; text: string; label: string }> = {
  A: { ring: 'stroke-yellow-400', text: 'text-yellow-400', label: 'bg-yellow-400 text-yellow-900' },
  B: { ring: 'stroke-blue-400',   text: 'text-blue-400',   label: 'bg-blue-400 text-blue-900' },
  C: { ring: 'stroke-orange-400', text: 'text-orange-400', label: 'bg-orange-400 text-orange-900' },
  D: { ring: 'stroke-red-400',    text: 'text-red-400',    label: 'bg-red-400 text-red-900' },
};

// ── props ─────────────────────────────────────────────────────────────────

interface ResultScreenProps {
  state: QuizState;
  grade: string;
  gradeMessage: string;
  formattedTime: string;
  onRestart: () => void;
}

// ── 원형 프로그레스 ───────────────────────────────────────────────────────

function CircleProgress({ score, total, grade }: { score: number; total: number; grade: string }) {
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const [offset, setOffset] = useState<number>(CIRCUMFERENCE);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE['D'];

  useEffect(() => {
    const ratio = total > 0 ? score / total : 0;
    const target = CIRCUMFERENCE * (1 - ratio);
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [score, total, CIRCUMFERENCE]);

  useEffect(() => {
    if (score === 0) return;
    const STEP_MS = 1000 / score;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setDisplayScore(current);
      if (current >= score) clearInterval(id);
    }, STEP_MS);
    return () => clearInterval(id);
  }, [score]);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={RADIUS} fill="none" className="stroke-white/10" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={RADIUS} fill="none"
          className={`${style.ring} transition-all duration-1000 ease-out`}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${style.text}`} aria-label={`${score}점 / ${total}점`}>
          {displayScore}
        </span>
        <span className="text-white/40 text-sm" aria-hidden="true">/ {total}</span>
      </div>
    </div>
  );
}

// ── 과목별 바 그래프 ──────────────────────────────────────────────────────

function SubjectBar({ label, correct, total, color }: { label: string; correct: number; total: number; color: string }) {
  const [width, setWidth] = useState<number>(0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/80 font-medium">{label}</span>
        <span className="text-white/60 tabular-nums">{correct} / {total} ({pct}%)</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

// ── 오답노트 ──────────────────────────────────────────────────────────────

const CIRCLE_NUMBERS_BADGE = ['①', '②', '③', '④'] as const;

function WrongAccordion({ state }: { state: QuizState }) {
  const [openId, setOpenId] = useState<number | null>(null);

  const wrongItems = state.questions
    .map((q, i) => ({ q, selected: state.answerLog[i] }))
    .filter(({ q, selected }) => selected !== null && selected !== undefined && selected !== q.answer) as { q: typeof state.questions[0]; selected: number }[];

  if (wrongItems.length === 0) {
    return <div className="text-center py-8 text-white/60 text-sm">모든 문제를 맞혔습니다! 🎊</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white/40 text-xs">
        총 <span className="text-incorrect font-bold">{wrongItems.length}문제</span> 오답
      </p>

      {wrongItems.map(({ q, selected }, idx) => {
        const isOpen = openId === q.id;
        return (
          <div key={q.id} className="rounded-xl border border-white/10 overflow-hidden bg-white/5">
            <button
              onClick={() => setOpenId(isOpen ? null : q.id)}
              className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-incorrect/20 text-incorrect text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <p className="flex-1 text-white/80 text-sm leading-snug line-clamp-2">
                {q.question.split('\n')[0]}
              </p>
              <span className="shrink-0 text-white/30 ml-2 mt-0.5">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 flex flex-col gap-3 text-sm border-t border-white/10">
                <div className="pt-3">
                  <span className="text-xs text-incorrect/70 uppercase tracking-wide font-semibold">내가 선택한 답</span>
                  <div className="mt-1.5 flex items-start gap-2 bg-incorrect/10 rounded-lg px-3 py-2 border border-incorrect/20">
                    <span className="shrink-0 text-incorrect font-bold text-sm">{CIRCLE_NUMBERS_BADGE[selected]}</span>
                    <p className="text-incorrect/90 text-sm leading-snug line-through decoration-incorrect/50">{q.options[selected]}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-correct/70 uppercase tracking-wide font-semibold">정답</span>
                  <div className="mt-1.5 flex items-start gap-2 bg-correct/10 rounded-lg px-3 py-2 border border-correct/20">
                    <span className="shrink-0 text-correct font-bold text-sm">{CIRCLE_NUMBERS_BADGE[q.answer]}</span>
                    <p className="text-correct font-semibold text-sm leading-snug">{q.options[q.answer]}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wide font-semibold">해설</span>
                  <p className="mt-1 text-white/70 leading-relaxed whitespace-pre-wrap text-xs">{q.explanation}</p>
                </div>

                <div className="bg-incorrect/10 rounded-lg px-3 py-2.5 border border-incorrect/20">
                  <span className="text-xs text-incorrect/80 uppercase tracking-wide font-semibold">왜 틀렸을까?</span>
                  <p className="mt-1 text-incorrect/90 leading-relaxed text-xs whitespace-pre-wrap">{q.wrongExplanation}</p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 font-medium">{q.source}</span>
                  {q.source === '기출' && q.exam && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 font-medium">{q.exam}&nbsp;{q.originalNumber}번</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 font-medium ml-auto">{q.difficulty}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 등급 뱃지 ────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const style = GRADE_STYLE[grade] ?? GRADE_STYLE['D'];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${style.label}`}>
      {grade}등급
    </span>
  );
}

// ── 섹션 래퍼 ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

export default function ResultScreen({ state, grade, gradeMessage, formattedTime, onRestart }: ResultScreenProps) {
  const subjectStats = (() => {
    let hrmCorrect = 0, hrmTotal = 0;
    let laborCorrect = 0, laborTotal = 0;
    state.questions.forEach((q, i) => {
      const selected = state.answerLog[i];
      const correct = selected === q.answer;
      if (q.category === 'HRM실무') { hrmTotal++; if (correct) hrmCorrect++; }
      else { laborTotal++; if (correct) laborCorrect++; }
    });
    return { hrmCorrect, hrmTotal, laborCorrect, laborTotal };
  })();

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <div className="bg-navy/80 backdrop-blur sticky top-0 z-10 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-white/60 text-sm font-medium">결과 확인</span>
        <span className="text-white/40 text-xs">{state.playerName}</span>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-8">

        {/* ① 점수 + 등급 */}
        <Section title="최종 점수">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-4">
            <CircleProgress score={state.score} total={state.questions.length} grade={grade} />

            <div className="flex flex-col items-center gap-2">
              <GradeBadge grade={grade} />
              <p className="text-white/70 text-sm text-center leading-relaxed max-w-xs">
                {gradeMessage}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-white/40 text-sm">
              <Clock size={14} />
              <span className="tabular-nums font-mono">{formattedTime} 소요</span>
            </div>
          </div>

          {/* 등급 기준 안내 */}
          <div className="grid grid-cols-4 gap-2 mt-1">
            {[
              { g: 'A', range: '18점 이상', desc: '합격 우수' },
              { g: 'B', range: '14~17점', desc: '합격 양호' },
              { g: 'C', range: '10~13점', desc: '복습 필요' },
              { g: 'D', range: '9점 이하', desc: '재학습' },
            ].map(({ g, range, desc }) => {
              const s = GRADE_STYLE[g];
              const isCurrent = grade === g;
              return (
                <div
                  key={g}
                  className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                    isCurrent ? 'border-white/30 bg-white/10' : 'border-white/5 bg-white/3'
                  }`}
                >
                  <span className={`text-lg font-black ${s.text} ${isCurrent ? '' : 'opacity-40'}`}>{g}</span>
                  <p className={`text-xs mt-0.5 ${isCurrent ? 'text-white/70' : 'text-white/30'}`}>{range}</p>
                  <p className={`text-xs ${isCurrent ? 'text-white/50' : 'text-white/20'}`}>{desc}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ② 과목별 성적 */}
        <Section title="과목별 성적">
          <div className="bg-white/5 rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
            <SubjectBar label="HRM실무" correct={subjectStats.hrmCorrect} total={subjectStats.hrmTotal} color="bg-blue-500" />
            <SubjectBar label="근로관계법" correct={subjectStats.laborCorrect} total={subjectStats.laborTotal} color="bg-purple-500" />
          </div>
        </Section>

        {/* ③ 오답노트 */}
        <Section title="오답노트">
          <WrongAccordion state={state} />
        </Section>

        {/* ④ 다시 도전 */}
        <div className="pb-4">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 bg-gold text-navy font-bold text-base py-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all duration-150 shadow-lg"
          >
            <RotateCcw size={18} />
            다시 도전하기
          </button>
        </div>

      </div>
    </div>
  );
}
