import { Check, X } from 'lucide-react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  isAnswered: boolean;
  onSelect: (i: number) => void;
}

const CIRCLE_NUMBERS = ['①', '②', '③', '④'] as const;

// confetti 파티클 설정 (CSS 변수로 개별 궤적 제어)
const CONFETTI = [
  { color: '#D4A843', tx: '-32px', ty: '-64px', tr: '120deg', delay: '0ms',   left: '22%' },
  { color: '#22C55E', tx:  '40px', ty: '-72px', tr: '-90deg', delay: '40ms',  left: '38%' },
  { color: '#3B82F6', tx:  '-8px', ty: '-80px', tr: '210deg', delay: '80ms',  left: '54%' },
  { color: '#A855F7', tx:  '48px', ty: '-56px', tr: '-160deg',delay: '20ms',  left: '68%' },
  { color: '#EF4444', tx:  '16px', ty: '-68px', tr: '300deg', delay: '60ms',  left: '80%' },
];

function getOptionStyle(
  index: number,
  selectedOption: number | null,
  isAnswered: boolean,
  correctAnswer: number,
): string {
  const base =
    'relative w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left ' +
    'transition-all duration-150 ';

  if (!isAnswered) {
    return base + 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm ' +
      'cursor-pointer active:scale-95 active:border-blue-500';
  }
  if (index === selectedOption) {
    return index === correctAnswer
      ? base + 'bg-correct border-correct text-white cursor-not-allowed scale-100'
      : base + 'bg-incorrect border-incorrect text-white cursor-not-allowed scale-100';
  }
  if (index === correctAnswer) {
    return base + 'bg-white border-correct cursor-not-allowed';
  }
  return base + 'bg-white border-gray-200 opacity-40 cursor-not-allowed';
}

export default function QuestionCard({
  question,
  selectedOption,
  isAnswered,
  onSelect,
}: QuestionCardProps) {
  const isCorrect = isAnswered && selectedOption !== null && selectedOption === question.answer;

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">

      {/* 정답 confetti */}
      {isCorrect && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" aria-hidden="true">
          {CONFETTI.map((p, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: p.left,
                top: '55%',
                backgroundColor: p.color,
                animationDelay: p.delay,
                '--tx': p.tx,
                '--ty': p.ty,
                '--tr': p.tr,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* 뱃지 */}
      <div className="flex items-center gap-2 flex-wrap">
        <CategoryBadge category={question.category} />
        <DifficultyBadge difficulty={question.difficulty} />
        {question.source === '기출' && question.exam && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
            {question.exam} {question.originalNumber}번
          </span>
        )}
      </div>

      {/* 문제 본문 */}
      <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
        {question.question}
      </p>

      {/* 보기 */}
      <div role="radiogroup" aria-label="보기 선택" className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selectedOption === i;
          const isCorrectOption = i === question.answer;

          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${CIRCLE_NUMBERS[i]} ${option}${isAnswered ? (isCorrectOption ? ' (정답)' : '') : ''}`}
              onClick={() => !isAnswered && onSelect(i)}
              disabled={isAnswered}
              className={getOptionStyle(i, selectedOption, isAnswered, question.answer)}
            >
              {/* 원문자 */}
              <span className="text-base sm:text-lg leading-none mt-0.5 shrink-0 font-semibold" aria-hidden="true">
                {CIRCLE_NUMBERS[i]}
              </span>

              {/* 텍스트 */}
              <span className="flex-1 text-xs sm:text-sm leading-relaxed">{option}</span>

              {/* 정오 아이콘 */}
              {isAnswered && isSelected && (
                <span className="shrink-0 mt-0.5" aria-hidden="true">
                  {isCorrectOption
                    ? <Check size={18} className="text-white" strokeWidth={3} />
                    : <X     size={18} className="text-white" strokeWidth={3} />
                  }
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: Question['category'] }) {
  const style =
    category === 'HRM실무'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${style}`}>
      {category}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Question['difficulty'] }) {
  const style =
    difficulty === '쉬움'
      ? 'bg-green-100 text-green-700'
      : difficulty === '보통'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${style}`}>
      {difficulty}
    </span>
  );
}
