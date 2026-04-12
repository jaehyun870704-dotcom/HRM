import type { Question } from '../types';

interface FeedbackPanelProps {
  isCorrect: boolean;
  question: Question;
  selectedOption: number;
}

const CIRCLE_NUMBERS = ['①', '②', '③', '④'] as const;

export default function FeedbackPanel({
  isCorrect,
  question,
  selectedOption,
}: FeedbackPanelProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`animate-slide-in-up rounded-xl border-2 overflow-hidden ${
        isCorrect ? 'bg-green-50 border-correct' : 'bg-red-50 border-incorrect'
      }`}
    >
      {/* 헤딩 */}
      <div
        className={`px-4 sm:px-5 py-3 flex items-center gap-2 ${
          isCorrect ? 'bg-correct' : 'bg-incorrect'
        }`}
      >
        <span className="text-white font-bold text-sm sm:text-base">
          {isCorrect ? '🎉 정답입니다!' : '❌ 오답입니다'}
        </span>
      </div>

      <div className="px-4 sm:px-5 py-4 flex flex-col gap-4 text-sm">

        {/* 오답일 때: 내가 선택한 답 강조 */}
        {!isCorrect && (
          <div className="bg-red-100 border border-red-200 rounded-lg px-3 sm:px-4 py-3">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              내가 선택한 답
            </span>
            <p className="mt-1 text-red-700 font-medium text-sm line-through decoration-red-400">
              {CIRCLE_NUMBERS[selectedOption]}&nbsp;{question.options[selectedOption]}
            </p>
          </div>
        )}

        {/* 정답 보기 */}
        <div className={`rounded-lg px-3 sm:px-4 py-3 ${isCorrect ? 'bg-green-100 border border-green-200' : 'bg-green-50 border border-green-200'}`}>
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
            정답
          </span>
          <p className="mt-1 text-green-800 font-semibold text-sm">
            {CIRCLE_NUMBERS[question.answer]}&nbsp;{question.options[question.answer]}
          </p>
        </div>

        {/* 해설 */}
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            해설
          </span>
          <p className="mt-1 text-gray-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
            {question.explanation}
          </p>
        </div>

        {/* 오답포인트 — 오답일 때만 */}
        {!isCorrect && (
          <div className="bg-red-100 rounded-lg px-3 sm:px-4 py-3 border border-red-200">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              왜 틀렸을까?
            </span>
            <p className="mt-1 text-red-700 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
              {question.wrongExplanation}
            </p>
          </div>
        )}

        {/* 출처 배지 */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
            {question.source}
          </span>
          {question.source === '기출' && question.exam && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
              {question.exam}&nbsp;{question.originalNumber}번
            </span>
          )}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium ml-auto">
            {question.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
