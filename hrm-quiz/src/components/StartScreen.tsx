import { useState, type KeyboardEvent } from 'react';
import { Trophy, Shuffle } from 'lucide-react';
import type { RoundFilter } from '../types';
import { questions } from '../data/questions';

interface StartScreenProps {
  onStart: (name: string, round: RoundFilter) => void;
  onTeacher: () => void;
}

export default function StartScreen({ onStart, onTeacher }: StartScreenProps) {
  const [name, setName] = useState<string>('');

  const handleStart = () => {
    if (name.trim()) onStart(name.trim(), '전체');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleStart();
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 py-12">
      {/* 타이틀 */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="text-gold" size={36} />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            HRM전문가 퀴즈
          </h1>
        </div>
        <p className="text-gold text-sm font-medium tracking-widest uppercase">
          한국공인노무사회 역량인증
        </p>
        <p className="text-white/50 text-sm mt-2">HRM실무 + 근로관계법</p>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-white/40 text-xs">
          <Shuffle size={12} />
          <span>전체 {questions.length}문제 중 랜덤 20문항 출제</span>
        </div>
      </div>

      {/* 입력 섹션 */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="이름을 입력하세요"
          maxLength={20}
          className="w-full bg-navy border border-white/40 rounded-xl px-4 py-3 text-white placeholder-white/40 text-base focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
        />
        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full bg-gold text-navy font-bold text-base rounded-xl py-3 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          시작하기 (20문제 랜덤 출제)
        </button>
        <button
          onClick={onTeacher}
          className="w-full border border-white/30 text-white/60 text-sm rounded-xl py-2.5 hover:bg-white/5 transition"
        >
          선생님 모드
        </button>
      </div>
    </div>
  );
}
