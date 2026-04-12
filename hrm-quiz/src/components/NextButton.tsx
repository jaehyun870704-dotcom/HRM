import { ArrowRight, Trophy } from 'lucide-react';

interface NextButtonProps {
  isAnswered: boolean;
  isLast: boolean;
  onNext: () => void;
}

export default function NextButton({ isAnswered, isLast, onNext }: NextButtonProps) {
  if (!isAnswered) return null;

  const label = isLast ? '결과 확인하기' : '다음 문제로 이동';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 flex justify-center px-4 pb-5 sm:pb-6 pt-4
        bg-gradient-to-t from-gray-100/95 to-transparent pointer-events-none"
    >
      <button
        onClick={onNext}
        aria-label={label}
        className="pointer-events-auto flex items-center gap-2 bg-gold text-navy font-bold
          text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl shadow-lg
          hover:brightness-110 active:scale-95 transition-all duration-150"
      >
        {isLast ? (
          <>
            결과 확인하기
            <Trophy size={17} aria-hidden="true" />
          </>
        ) : (
          <>
            다음 문제
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
