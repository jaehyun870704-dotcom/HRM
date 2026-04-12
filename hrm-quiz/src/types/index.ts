export type Category = 'HRM실무' | '근로관계법';
export type Difficulty = '쉬움' | '보통' | '어려움';
export type Source = '기출' | '이론';
export type ExamRound = '제39회' | '제40회' | '제41회' | null;
export type RoundFilter = '전체' | '제39회' | '제40회' | '제41회';

export interface Question {
  id: number;
  source: Source;
  exam: ExamRound;
  originalNumber: number | null;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;          // 0-index
  explanation: string;             // 정답 해설
  wrongExplanation: string;        // 오답 포인트
}

export interface RankRecord {
  name: string;
  score: number;
  total: number;
  grade: string;
  elapsedSeconds: number;
  playedAt: string;
}

export interface QuizState {
  phase: 'start' | 'playing' | 'result' | 'teacher';
  playerName: string;
  questions: Question[];
  currentIndex: number;
  selectedOption: number | null;
  isAnswered: boolean;
  score: number;
  elapsedSeconds: number;
  rankings: RankRecord[];
  /** 문제 순서대로 선택한 옵션 인덱스를 기록 (null = 미답) */
  answerLog: (number | null)[];
}
