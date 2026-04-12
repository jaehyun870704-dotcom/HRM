import { useEffect } from 'react';
import { useQuiz } from './hooks/useQuiz';
import StartScreen from './components/StartScreen';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import FeedbackPanel from './components/FeedbackPanel';
import NextButton from './components/NextButton';
import ResultScreen from './components/ResultScreen';
import TeacherDashboard from './components/TeacherDashboard';

export default function App() {
  const {
    state,
    currentQuestion,
    isCorrect,
    progress,
    grade,
    gradeMessage,
    formattedTime,
    startGame,
    selectAnswer,
    nextQuestion,
    restartGame,
    goToTeacher,
    backFromTeacher,
  } = useQuiz();

  // ── 키보드 내비게이션 ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드 포커스 중엔 무시
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // 1~4: 보기 선택
      if (['1', '2', '3', '4'].includes(e.key) && !state.isAnswered) {
        selectAnswer(Number(e.key) - 1);
        return;
      }

      // Enter / Space: 다음 문제
      if ((e.key === 'Enter' || e.key === ' ') && state.isAnswered) {
        e.preventDefault();
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.isAnswered, selectAnswer, nextQuestion]);

  // ── Teacher ──────────────────────────────────────────────────────────────
  if (state.phase === 'teacher') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-[900px] mx-auto min-h-screen">
          <TeacherDashboard rankings={state.rankings} onBack={backFromTeacher} />
        </div>
      </div>
    );
  }

  // ── Start ────────────────────────────────────────────────────────────────
  if (state.phase === 'start') {
    return (
      <div className="min-h-screen bg-navy">
        <div className="max-w-[640px] mx-auto min-h-screen">
          <StartScreen onStart={(name, round) => startGame(name, round)} onTeacher={goToTeacher} />
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if (state.phase === 'result') {
    return (
      <div className="min-h-screen bg-navy">
        <div className="max-w-[640px] mx-auto min-h-screen">
          <ResultScreen
            state={state}
            grade={grade}
            gradeMessage={gradeMessage}
            formattedTime={formattedTime}
            onRestart={restartGame}
          />
        </div>
      </div>
    );
  }

  // ── Playing: 엣지케이스 ─────────────────────────────────────────────────
  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="text-center text-white">
          <p className="text-xl font-bold mb-2">문제 데이터를 불러올 수 없습니다.</p>
          <p className="text-white/50 text-sm mb-6">src/data/questions.ts 파일을 확인해 주세요.</p>
          <button
            onClick={restartGame}
            className="bg-gold text-navy font-bold px-6 py-2.5 rounded-xl hover:brightness-110 transition"
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isLast = state.currentIndex === state.questions.length - 1;

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-[640px] mx-auto min-h-screen bg-gray-50 flex flex-col">

        {/* 상단 고정: ProgressBar */}
        <ProgressBar
          current={state.currentIndex + 1}
          total={state.questions.length}
          progress={progress}
          category={currentQuestion.category}
          elapsedTime={formattedTime}
        />

        {/* 스크롤 가능 영역 — 하단 NextButton 높이만큼 padding */}
        <div className="flex-1 px-3 sm:px-4 py-4 sm:py-5 flex flex-col gap-3 sm:gap-4 pb-28 overflow-y-auto">

          {/* 문제 전환 fade-in: key로 remount 유도 */}
          <div key={state.currentIndex} className="animate-fade-in-up">
            <QuestionCard
              question={currentQuestion}
              selectedOption={state.selectedOption}
              isAnswered={state.isAnswered}
              onSelect={selectAnswer}
            />
          </div>

          {/* FeedbackPanel: mount 시 animate-slide-in-up 적용 */}
          {state.isAnswered && state.selectedOption !== null && (
            <FeedbackPanel
              isCorrect={isCorrect}
              question={currentQuestion}
              selectedOption={state.selectedOption}
            />
          )}
        </div>

        {/* 하단 고정: NextButton */}
        <NextButton
          isAnswered={state.isAnswered}
          isLast={isLast}
          onNext={nextQuestion}
        />
      </div>

      {/* 키보드 힌트 (데스크톱만) */}
      {!state.isAnswered && (
        <div
          className="hidden sm:flex fixed bottom-4 right-4 gap-2 text-white/30 text-xs select-none"
          aria-hidden="true"
        >
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">1</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">2</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">3</kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">4</kbd>
          <span className="ml-1">로 선택</span>
        </div>
      )}
      {state.isAnswered && (
        <div
          className="hidden sm:flex fixed bottom-4 right-4 gap-2 text-white/30 text-xs select-none items-center"
          aria-hidden="true"
        >
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd>
          <span>다음</span>
        </div>
      )}
    </div>
  );
}
