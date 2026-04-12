import { useReducer, useEffect, useMemo, useCallback } from 'react';
import type { Question, RankRecord, QuizState, RoundFilter } from '../types';
import { questions as allQuestions } from '../data/questions';

// ── 액션 타입 ──────────────────────────────────────────────────────────────

type QuizAction =
  | { type: 'START_GAME'; playerName: string; round: RoundFilter }
  | { type: 'SELECT_ANSWER'; optionIndex: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'TICK' }
  | { type: 'GO_TEACHER' }
  | { type: 'BACK_FROM_TEACHER' };

// ── localStorage ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'hrm-quiz-rankings';

function loadRankings(): RankRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RankRecord[]) : [];
  } catch {
    return [];
  }
}

function saveRankings(rankings: RankRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankings));
  } catch {
    // 저장 공간 부족 등 예외는 무시
  }
}

// ── 유틸리티 ───────────────────────────────────────────────────────────────

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function calcGrade(score: number): string {
  if (score >= 18) return 'A';
  if (score >= 14) return 'B';
  if (score >= 10) return 'C';
  return 'D';
}

function formatTime(seconds: number): string {
  if (seconds > 3599) {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── 초기 상태 ─────────────────────────────────────────────────────────────

const initialState: QuizState = {
  phase: 'start',
  playerName: '',
  questions: [],
  currentIndex: 0,
  selectedOption: null,
  isAnswered: false,
  score: 0,
  elapsedSeconds: 0,
  rankings: [],
  answerLog: [],
};

// ── 리듀서 ────────────────────────────────────────────────────────────────

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START_GAME': {
      const pool = action.round === '전체'
        ? allQuestions
        : allQuestions.filter(q => q.exam === action.round);
      const shuffled = fisherYatesShuffle(pool);
      const selected = shuffled.slice(0, 20);
      return {
        ...initialState,
        rankings: state.rankings,
        playerName: action.playerName,
        questions: selected,
        answerLog: new Array(selected.length).fill(null) as null[],
        phase: 'playing',
      };
    }

    case 'SELECT_ANSWER': {
      if (state.isAnswered) return state;
      const correct =
        action.optionIndex === state.questions[state.currentIndex].answer;
      const newLog = [...state.answerLog];
      newLog[state.currentIndex] = action.optionIndex;
      return {
        ...state,
        selectedOption: action.optionIndex,
        isAnswered: true,
        score: correct ? state.score + 1 : state.score,
        answerLog: newLog,
      };
    }

    case 'NEXT_QUESTION': {
      const isLast = state.currentIndex === state.questions.length - 1;
      if (isLast) {
        return quizReducer(state, { type: 'FINISH_GAME' });
      }
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        selectedOption: null,
        isAnswered: false,
      };
    }

    case 'FINISH_GAME': {
      const grade = calcGrade(state.score);
      const newRecord: RankRecord = {
        name: state.playerName,
        score: state.score,
        total: state.questions.length,
        grade,
        elapsedSeconds: state.elapsedSeconds,
        playedAt: new Date().toISOString(),
      };
      const updated = [...state.rankings, newRecord]
        .sort((a, b) =>
          b.score !== a.score
            ? b.score - a.score
            : a.elapsedSeconds - b.elapsedSeconds,
        )
        .slice(0, 10);
      return {
        ...state,
        phase: 'result',
        rankings: updated,
      };
    }

    case 'RESTART_GAME': {
      return {
        ...initialState,
        rankings: state.rankings,
        phase: 'start',
      };
    }

    case 'GO_TEACHER': {
      return { ...state, phase: 'teacher' };
    }

    case 'BACK_FROM_TEACHER': {
      return { ...state, phase: 'start' };
    }

    case 'TICK': {
      if (state.phase !== 'playing') return state;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    }

    default:
      return state;
  }
}

// ── 훅 ───────────────────────────────────────────────────────────────────

export function useQuiz() {
  const [state, dispatch] = useReducer(
    quizReducer,
    initialState,
    (base) => ({ ...base, rankings: loadRankings() }),
  );

  // rankings 변경 시 localStorage 동기화
  useEffect(() => {
    saveRankings(state.rankings);
  }, [state.rankings]);

  // 타이머
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  // 파생 데이터
  const currentQuestion = useMemo<Question | undefined>(
    () => state.questions[state.currentIndex],
    [state.questions, state.currentIndex],
  );

  const isCorrect = useMemo<boolean>(
    () =>
      state.selectedOption !== null &&
      currentQuestion !== undefined &&
      state.selectedOption === currentQuestion.answer,
    [state.selectedOption, currentQuestion],
  );

  const progress = useMemo<number>(
    () =>
      state.questions.length > 0
        ? ((state.currentIndex + 1) / state.questions.length) * 100
        : 0,
    [state.currentIndex, state.questions.length],
  );

  const grade = useMemo<string>(() => calcGrade(state.score), [state.score]);

  const gradeMessage = useMemo<string>(() => {
    switch (grade) {
      case 'A': return `A등급 — 20문제 중 ${state.score}문제 정답 (90% 이상). HRM 전문가 수준의 실력입니다!`;
      case 'B': return `B등급 — 20문제 중 ${state.score}문제 정답 (70% 이상). 대부분의 개념을 이해하고 있습니다. 취약 파트를 보완하세요.`;
      case 'C': return `C등급 — 20문제 중 ${state.score}문제 정답 (50% 이상). 기본 개념은 잡혀 있으나 반복 학습이 필요합니다.`;
      default:   return `D등급 — 20문제 중 ${state.score}문제 정답 (50% 미만). HRM·근로관계법 기초부터 차근차근 학습하세요.`;
    }
  }, [grade, state.score]);

  const formattedTime = useMemo<string>(
    () => formatTime(state.elapsedSeconds),
    [state.elapsedSeconds],
  );

  // 액션 핸들러
  const startGame = useCallback((playerName: string, round: RoundFilter = '전체') => {
    dispatch({ type: 'START_GAME', playerName, round });
  }, []);

  const selectAnswer = useCallback((optionIndex: number) => {
    dispatch({ type: 'SELECT_ANSWER', optionIndex });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);

  const goToTeacher = useCallback(() => {
    dispatch({ type: 'GO_TEACHER' });
  }, []);

  const backFromTeacher = useCallback(() => {
    dispatch({ type: 'BACK_FROM_TEACHER' });
  }, []);

  return {
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
  };
}
