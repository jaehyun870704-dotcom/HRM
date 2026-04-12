import { Timer } from 'lucide-react';
import type { Category } from '../types';

interface ProgressBarProps {
  current: number;
  total: number;
  progress: number;
  category: Category;
  elapsedTime: string;
}

const CATEGORY_STYLES: Record<Category, { bar: string; badge: string; label: string }> = {
  'HRM실무': {
    bar: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    label: 'HRM실무',
  },
  '근로관계법': {
    bar: 'bg-purple-500',
    badge: 'bg-purple-100 text-purple-700',
    label: '근로관계법',
  },
};

export default function ProgressBar({
  current,
  total,
  progress,
  category,
  elapsedTime,
}: ProgressBarProps) {
  const style = CATEGORY_STYLES[category];

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* 문제 번호 */}
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap tabular-nums">
          {current}&nbsp;/&nbsp;{total}
        </span>

        {/* 진행률 바 + 카테고리 뱃지 */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}
            >
              {style.label}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 타이머 */}
        <div className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
          <Timer size={15} />
          <span className="text-sm font-mono tabular-nums">{elapsedTime}</span>
        </div>
      </div>
    </div>
  );
}
