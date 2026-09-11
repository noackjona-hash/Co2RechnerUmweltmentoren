'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type Category, formatCO2 } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  X,
  Plus,
  Minus,
} from 'lucide-react';

interface QuizQuestion {
  id: string;
  category: string;
  questionText: string;
  questionType: string;
  options: { label: string; value: number }[] | null;
  unit: string | null;
  co2Factor: number;
  minValue: number | null;
  maxValue: number | null;
  step: number | null;
  defaultValue: number | null;
  helpText: string | null;
  orderIndex: number;
}

interface Answer {
  questionId: string;
  category: string;
  numericalValue: number;
  calculatedCo2: number;
  optionIndex?: number;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCategoryIntro, setShowCategoryIntro] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const currentValue = currentQuestion ? answers[currentQuestion.id]?.numericalValue : undefined;

  const calculateCo2 = useCallback((question: QuizQuestion, value: number): number => {
    return value * question.co2Factor;
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();

        if (data.isCompleted) {
          router.push('/results');
          return;
        }

        setQuestions(data.questions || []);
        setStudentId(data.studentId);
        setIsGuest(data.isGuest || false);

        const storageKey = `co2rechner_quiz_progress_${data.studentId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || {});
            setCurrentIndex(parsed.currentIndex || 0);
            setShowCategoryIntro(false);
          } catch {
            /* ignore */
          }
        }

        if (data.responses?.length > 0 && !saved) {
          const existing: Record<string, Answer> = {};
          data.responses.forEach(
            (r: { questionId: string; category: string; numericalValue: number; calculatedCo2: number }) => {
              existing[r.questionId] = {
                questionId: r.questionId,
                category: r.category,
                numericalValue: r.numericalValue,
                calculatedCo2: r.calculatedCo2,
              };
            }
          );
          setAnswers(existing);
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [router]);

  useEffect(() => {
    if (studentId && questions.length > 0 && Object.keys(answers).length > 0) {
      const storageKey = `co2rechner_quiz_progress_${studentId}`;
      localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex }));
    }
  }, [answers, currentIndex, questions.length, studentId]);

  useEffect(() => {
    if (loading || !currentQuestion) return;

    if (answers[currentQuestion.id] === undefined) {
      const defaultVal = currentQuestion.defaultValue ?? currentQuestion.minValue;
      if (defaultVal !== null && defaultVal !== undefined) {
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            category: currentQuestion.category,
            numericalValue: defaultVal,
            calculatedCo2: calculateCo2(currentQuestion, defaultVal),
            optionIndex:
              currentQuestion.options && currentQuestion.options.length > 0
                ? (currentQuestion.options as { label: string; value: number }[]).findIndex(
                    (o) => o.value === defaultVal
                  )
                : undefined,
          },
        }));
      }
    }
  }, [currentIndex, currentQuestion, answers, loading, calculateCo2]);

  const saveResponseToServer = async (answer: Answer) => {
    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answer),
      });
    } catch {
      /* ignore */
    }
  };

  const handleAnswer = (value: number, optionIdx?: number) => {
    if (!currentQuestion) return;
    const co2 = calculateCo2(currentQuestion, value);
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      numericalValue: value,
      calculatedCo2: co2,
      optionIndex: optionIdx,
    };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newAnswer }));
    saveResponseToServer(newAnswer);
  };

  const handleIncrement = useCallback(() => {
    if (!currentQuestion) return;
    const step = currentQuestion.step || 1;
    const max = currentQuestion.maxValue ?? Infinity;
    const cur = currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0;
    const next = Math.min(cur + step, max);
    handleAnswer(next);
  }, [currentQuestion, currentValue]);

  const handleDecrement = useCallback(() => {
    if (!currentQuestion) return;
    const step = currentQuestion.step || 1;
    const min = currentQuestion.minValue ?? 0;
    const cur = currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0;
    const next = Math.max(cur - step, min);
    handleAnswer(next);
  }, [currentQuestion, currentValue]);

  const currentCategory = (currentQuestion?.category as Category) || 'mobility';
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const categoryQuestions = questions.filter((q) => q.category === currentCategory);
  const categoryIndex = categoryQuestions.findIndex((q) => q.id === currentQuestion?.id);
  const isNewCategory = categoryIndex === 0;

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      if (nextQ && nextQ.category !== currentQuestion?.category) {
        setShowCategoryIntro(true);
      }
      setShowHelp(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions, currentQuestion]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setShowHelp(false);
      setShowCategoryIntro(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount < questions.length) {
        const unanswered = questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
          const firstUnansweredIndex = questions.findIndex((q) => q.id === unanswered[0].id);
          setCurrentIndex(firstUnansweredIndex);
          setSubmitting(false);
          return;
        }
      }

      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: true }),
      });

      if (studentId) {
        localStorage.removeItem(`co2rechner_quiz_progress_${studentId}`);
      }

      router.push('/results');
    } catch {
      setSubmitting(false);
    }
  }, [answers, questions, studentId, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (loading || !currentQuestion) return;

      if (
        (currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') &&
        currentQuestion.options
      ) {
        const numKey = parseInt(e.key);
        const optionsArray = currentQuestion.options as { label: string; value: number }[];
        if (!isNaN(numKey) && numKey >= 1 && numKey <= optionsArray.length) {
          const selectedOption = optionsArray[numKey - 1];
          handleAnswer(selectedOption.value, numKey - 1);
        }
      }

      if (currentQuestion.questionType === 'slider') {
        if (e.key === 'ArrowLeft') handleDecrement();
        if (e.key === 'ArrowRight') handleIncrement();
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goPrev();
      } else if (
        (e.key === 'ArrowRight' || e.key === 'Enter') &&
        currentIndex < questions.length - 1
      ) {
        goNext();
      } else if (e.key === 'Enter' && currentIndex === questions.length - 1) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentIndex,
    loading,
    currentQuestion,
    questions,
    handleDecrement,
    handleIncrement,
    goPrev,
    goNext,
    handleSubmit,
    handleAnswer,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Fragebogen wird geladen...
        </p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const totalProgress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const catInfo = CATEGORIES[currentCategory] || { label: 'Fragebogen' };
  const isLastQuestion = currentIndex === questions.length - 1;

  // Intermission between categories
  if (showCategoryIntro && isNewCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="paper-sheet w-full max-w-md p-8 sm:p-10 space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Abschnitt {categories.indexOf(currentCategory) + 1} von {categories.length}</span>
            <span className="font-mono text-[11px]">CO₂-Erfassung</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              {catInfo.label}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Es folgen {categoryQuestions.length} Fragen zu deinen Gewohnheiten im Bereich {catInfo.label}.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCategoryIntro(false)}
              className="w-full py-2.5 paper-btn-primary text-xs"
            >
              Abschnitt beginnen →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8 bg-background">
      {/* Minimal Header & Progress Line */}
      <header className="w-full border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isGuest && (
              <span className="text-[10px] px-1.5 py-0.5 border border-border rounded text-muted-foreground">
                Gast
              </span>
            )}
            <span className="text-muted-foreground">Bereich:</span>
            <span className="font-medium text-foreground">
              {catInfo.label}
            </span>
          </div>
          <span className="text-muted-foreground font-mono text-[11px]">
            Frage {currentIndex + 1} von {questions.length}
          </span>
        </div>

        {/* 2px Minimal Progress Line */}
        <div className="w-full h-[2px] bg-border">
          <div
            className="h-full bg-foreground transition-all duration-200"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </header>

      {/* Main Minimal Question Box */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 sm:py-14 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">
              {catInfo.label} · Frage {categoryIndex + 1} / {categoryQuestions.length}
            </span>

            {currentQuestion.helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Hinweis</span>
              </button>
            )}
          </div>

          {/* Help box */}
          {showHelp && currentQuestion.helpText && (
            <div className="p-3.5 rounded-lg border border-border bg-muted/50 text-xs text-foreground flex items-start gap-2.5 leading-relaxed">
              <p className="flex-1 text-muted-foreground">{currentQuestion.helpText}</p>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-medium text-foreground leading-snug tracking-tight">
            {currentQuestion.questionText}
          </h2>

          {/* Inputs Section */}
          <div className="space-y-4 pt-1">
            {/* 1. SLIDER */}
            {currentQuestion.questionType === 'slider' && (
              <div className="space-y-5 py-2">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-mono font-semibold text-foreground">
                    {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                  </span>
                  {currentQuestion.unit && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-9 h-9 border border-border rounded-md hover:bg-muted flex items-center justify-center cursor-pointer shrink-0 text-foreground transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min={currentQuestion.minValue ?? 0}
                    max={currentQuestion.maxValue ?? 100}
                    step={currentQuestion.step ?? 1}
                    value={currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                    className="slider-paper flex-1"
                  />

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-9 h-9 border border-border rounded-md hover:bg-muted flex items-center justify-center cursor-pointer shrink-0 text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>{currentQuestion.minValue ?? 0} {currentQuestion.unit}</span>
                  <span>{currentQuestion.maxValue ?? 100} {currentQuestion.unit}</span>
                </div>
              </div>
            )}

            {/* 2. NUMBER INPUT */}
            {currentQuestion.questionType === 'number' && (
              <div className="flex items-center justify-center gap-3 py-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-9 h-9 border border-border rounded-md hover:bg-muted flex items-center justify-center cursor-pointer text-foreground transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={currentQuestion.minValue ?? undefined}
                    max={currentQuestion.maxValue ?? undefined}
                    value={currentValue ?? ''}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 text-lg font-mono font-medium text-center border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-foreground"
                  />
                  {currentQuestion.unit && (
                    <span className="text-xs text-muted-foreground">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-9 h-9 border border-border rounded-md hover:bg-muted flex items-center justify-center cursor-pointer text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 3. MULTIPLE CHOICE */}
            {(currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') &&
              currentQuestion.options && (
                <div className="space-y-2">
                  {(currentQuestion.options as { label: string; value: number }[]).map((option, i) => {
                    const isSelected =
                      answers[currentQuestion.id]?.optionIndex !== undefined
                        ? answers[currentQuestion.id]?.optionIndex === i
                        : currentValue === option.value &&
                          (currentQuestion.options as { label: string; value: number }[]).findIndex(
                            (o) => o.value === currentValue
                          ) === i;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswer(option.value, i)}
                        className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center justify-between cursor-pointer text-xs sm:text-sm ${
                          isSelected
                            ? 'border-foreground bg-muted font-medium text-foreground'
                            : 'border-border bg-background hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono text-muted-foreground w-4">
                            {i + 1}.
                          </span>
                          <span className="leading-snug">{option.label}</span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>

          {/* CO2 Hint */}
          {answers[currentQuestion.id] && (
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Geschätzter Ausstoß:</span>
              <span className="font-mono text-foreground font-medium">
                ca. {formatCO2(answers[currentQuestion.id].calculatedCo2)} / Jahr
              </span>
            </div>
          )}
        </article>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="paper-btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zurück
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="paper-btn-primary text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              {submitting ? 'Wird ausgewertet...' : 'Auswertung anzeigen'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="paper-btn-primary text-xs"
            >
              Weiter
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
