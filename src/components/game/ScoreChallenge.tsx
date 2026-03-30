/**
 * ScoreChallenge — DOM-based quiz game testing bowling scoring knowledge.
 *
 * Shows a partial scorecard scenario and asks the player to identify the
 * correct score. 10 questions per game, increasing difficulty. Timer
 * countdown + streak multiplier for scoring.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Container } from "@/components/Container";
import { cn } from "@/lib/cn";
import { generateQuestions, type QuizQuestion } from "@/lib/score-challenge-questions";

/* ── Constants ──────────────────────────────────────────── */

const TIMER_DURATION = 10; // seconds per question
const BASE_POINTS = 100;
const TIME_BONUS_MULTIPLIER = 10; // points per second remaining
const STREAK_MULTIPLIER = 0.5; // bonus per consecutive correct answer

/* ── Types ──────────────────────────────────────────────── */

type GamePhase = "MENU" | "PLAYING" | "RESULT" | "GAME_OVER";

interface GameState {
  phase: GamePhase;
  questions: QuizQuestion[];
  currentQuestion: number;
  score: number;
  streak: number;
  correctCount: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  timeRemaining: number;
}

/* ── Component ──────────────────────────────────────────── */

export function ScoreChallenge() {
  const [state, setState] = useState<GameState>({
    phase: "MENU",
    questions: [],
    currentQuestion: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    selectedAnswer: null,
    isCorrect: null,
    timeRemaining: TIMER_DURATION,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerBarRef = useRef<HTMLDivElement>(null);

  // Update timer bar width imperatively (avoids inline style lint error)
  useEffect(() => {
    if (timerBarRef.current) {
      timerBarRef.current.style.width = `${(state.timeRemaining / TIMER_DURATION) * 100}%`;
    }
  }, [state.timeRemaining]);

  /** Start timer countdown. */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 0.1) {
          // Time's up — mark as wrong
          if (timerRef.current) clearInterval(timerRef.current);
          return {
            ...prev,
            phase: "RESULT",
            isCorrect: false,
            selectedAnswer: -1,
            streak: 0,
            timeRemaining: 0,
          };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 0.1 };
      });
    }, 100);
  }, []);

  /** Start a new game. */
  const startGame = useCallback(() => {
    const questions = generateQuestions(10);
    setState({
      phase: "PLAYING",
      questions,
      currentQuestion: 0,
      score: 0,
      streak: 0,
      correctCount: 0,
      selectedAnswer: null,
      isCorrect: null,
      timeRemaining: TIMER_DURATION,
    });
    startTimer();
  }, [startTimer]);

  /** Select an answer. */
  const selectAnswer = useCallback(
    (choiceIndex: number) => {
      setState((prev) => {
        if (prev.phase !== "PLAYING" || prev.selectedAnswer !== null) return prev;
        if (timerRef.current) clearInterval(timerRef.current);

        const question = prev.questions[prev.currentQuestion];
        const correct = choiceIndex === question.correctIndex;
        const timeBonus = Math.floor(prev.timeRemaining * TIME_BONUS_MULTIPLIER);
        const streakBonus = correct ? Math.floor(prev.streak * STREAK_MULTIPLIER * BASE_POINTS) : 0;
        const points = correct ? BASE_POINTS + timeBonus + streakBonus : 0;

        return {
          ...prev,
          phase: "RESULT",
          selectedAnswer: choiceIndex,
          isCorrect: correct,
          score: prev.score + points,
          streak: correct ? prev.streak + 1 : 0,
          correctCount: prev.correctCount + (correct ? 1 : 0),
        };
      });
    },
    [],
  );

  /** Move to next question or end game. */
  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestion + 1 >= prev.questions.length) {
        return { ...prev, phase: "GAME_OVER" };
      }
      return {
        ...prev,
        phase: "PLAYING",
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        isCorrect: null,
        timeRemaining: TIMER_DURATION,
      };
    });
    startTimer();
  }, [startTimer]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ── Render ───────────────────────────────────────── */

  if (state.phase === "MENU") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <span className="text-6xl" aria-hidden="true">🧠</span>
        <h1 className="text-3xl font-bold uppercase tracking-wider">Score Challenge</h1>
        <p className="max-w-md text-sm text-text-muted">
          Test your bowling scoring knowledge! 10 questions with increasing
          difficulty. Answer quickly for bonus points.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Start Quiz
        </button>
      </Container>
    );
  }

  if (state.phase === "GAME_OVER") {
    const percentage = Math.round((state.correctCount / state.questions.length) * 100);
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <span className="text-5xl" aria-hidden="true">🏆</span>
        <h2 className="text-2xl font-bold uppercase tracking-wider">Quiz Complete!</h2>
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-black tabular-nums text-accent">
            {state.score}
          </p>
          <p className="text-sm text-text-muted">
            {state.correctCount}/{state.questions.length} correct ({percentage}%)
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Play Again
        </button>
      </Container>
    );
  }

  const question = state.questions[state.currentQuestion];
  const showResult = state.phase === "RESULT";

  return (
    <Container className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs font-bold">
            Q{state.currentQuestion + 1}/{state.questions.length}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              question.difficulty === "easy" && "bg-green-500/20 text-green-400",
              question.difficulty === "medium" && "bg-yellow-500/20 text-yellow-400",
              question.difficulty === "hard" && "bg-red-500/20 text-red-400",
            )}
          >
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {state.streak > 1 && (
            <span className="text-xs font-bold text-(--color-score-strike)">
              🔥 {state.streak}x streak
            </span>
          )}
          <span className="text-lg font-black tabular-nums text-accent">
            {state.score}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="timer"
        aria-label={`${Math.round(state.timeRemaining)} seconds remaining`}
      >
        <div
          ref={timerBarRef}
          className={cn(
            "h-full rounded-full transition-all duration-100",
            state.timeRemaining > 5
              ? "bg-green-500"
              : state.timeRemaining > 2
                ? "bg-yellow-500"
                : "bg-red-500",
          )}
        />
      </div>

      {/* Scenario */}
      <div className="rounded-xl border border-border bg-panel p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Scenario
        </p>
        <p className="mt-2 font-mono text-sm leading-relaxed">{question.scenario}</p>
      </div>

      {/* Question */}
      <p className="text-center text-lg font-bold">{question.question}</p>

      {/* Answer choices */}
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, i) => {
          const isSelected = state.selectedAnswer === i;
          const isCorrectAnswer = i === question.correctIndex;
          let bgClass = "bg-surface-elevated hover:bg-accent/20";

          if (showResult) {
            if (isCorrectAnswer) {
              bgClass = "bg-green-500/20 ring-2 ring-green-500";
            } else if (isSelected && !state.isCorrect) {
              bgClass = "bg-red-500/20 ring-2 ring-red-500";
            } else {
              bgClass = "bg-surface-elevated opacity-50";
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={showResult}
              onClick={() => selectAnswer(i)}
              className={cn(
                "flex h-16 items-center justify-center rounded-xl border border-border text-xl font-bold tabular-nums transition-all",
                bgClass,
                !showResult && "cursor-pointer active:scale-95",
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <p
            className={cn(
              "text-lg font-bold uppercase",
              state.isCorrect ? "text-green-400" : "text-red-400",
            )}
          >
            {state.isCorrect ? "Correct! ✓" : "Wrong ✗"}
          </p>
          {!state.isCorrect && (
            <p className="text-sm text-text-muted">
              The answer was{" "}
              <span className="font-bold text-(--color-text-primary)">
                {question.choices[question.correctIndex]}
              </span>
            </p>
          )}
          <button
            type="button"
            onClick={nextQuestion}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            {state.currentQuestion + 1 < state.questions.length ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </Container>
  );
}
