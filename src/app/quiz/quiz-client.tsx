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
        const co2 = calculateCo2(currentQuestion, defaultVal);
        setAnswers((prev) => {
          if (prev[currentQuestion.id] !== undefined) return prev;
          return {
            ...prev,
            [currentQuestion.id]: {
              questionId: currentQuestion.id,
              category: currentQuestion.category,
              numericalValue: defaultVal,
              calculatedCo2: co2,
            },
          };
        });
      }
    }
  }, [currentIndex, loading, currentQuestion, calculateCo2, answers]);

  const categories = ['mobility', 'food', 'energy', 'consumption'] as Category[];

  const getCategoryQuestions = useCallback(
    (cat: string) => questions.filter((q) => q.category === cat),
    [questions]
  );

  const currentCategory = (currentQuestion?.category || 'mobility') as Category;
  const categoryQuestions = getCategoryQuestions(currentCategory);
  const categoryIndex = categoryQuestions.findIndex((q) => q.id === currentQuestion?.id);

  const prevCategory = currentIndex > 0 ? questions[currentIndex - 1]?.category : null;
  const isNewCategory = prevCategory !== currentCategory;

  const handleAnswer = useCallback(
    (value: number, optionIndex?: number) => {
      if (!currentQuestion) return;
      const co2 = calculateCo2(currentQuestion, value);

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          category: currentQuestion.category,
          numericalValue: value,
          calculatedCo2: co2,
          optionIndex,
        },
      }));

      // Auto-advance on choice selection with brief feedback
      if (currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') {
        if (currentIndex < questions.length - 1) {
          setTimeout(() => {
            const nextQ = questions[currentIndex + 1];
            if (nextQ && nextQ.category !== currentQuestion.category) {
              setShowCategoryIntro(true);
            }
            setCurrentIndex((prevIndex) => prevIndex + 1);
            setShowHelp(false);
          }, 250);
        }
      }
    },
    [currentQuestion, calculateCo2, currentIndex, questions]
  );

  const handleDecrement = useCallback(() => {
    if (!currentQuestion) return;
    const min = currentQuestion.minValue ?? 0;
    const step = currentQuestion.step ?? 1;
    const current = currentValue ?? currentQuestion.defaultValue ?? min;
    const newVal = Math.max(min, current - step);
    handleAnswer(newVal);
  }, [currentQuestion, currentValue, handleAnswer]);

  const handleIncrement = useCallback(() => {
    if (!currentQuestion) return;
    const max = currentQuestion.maxValue ?? 100;
    const step = currentQuestion.step ?? 1;
    const current = currentValue ?? currentQuestion.defaultValue ?? (currentQuestion.minValue ?? 0);
    const newVal = Math.min(max, current + step);
    handleAnswer(newVal);
  }, [currentQuestion, currentValue, handleAnswer]);

  const goNext = () => {
    if (currentQuestion && !answers[currentQuestion.id]) {
      const defaultVal = currentQuestion.defaultValue ?? currentQuestion.minValue;
      if (defaultVal !== null && defaultVal !== undefined) {
        const co2 = calculateCo2(currentQuestion, defaultVal);
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            category: currentQuestion.category,
            numericalValue: defaultVal,
            calculatedCo2: co2,
          },
        }));
      }
    }

    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      if (nextQ.category !== currentCategory) {
        setShowCategoryIntro(true);
      }
      setCurrentIndex(currentIndex + 1);
      setShowHelp(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setShowCategoryIntro(false);
      setCurrentIndex(currentIndex - 1);
      setShowHelp(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let finalAnswers = { ...answers };
      if (currentQuestion && !answers[currentQuestion.id]) {
        const defaultVal = currentQuestion.defaultValue ?? currentQuestion.minValue;
        if (defaultVal !== null && defaultVal !== undefined) {
          const co2 = calculateCo2(currentQuestion, defaultVal);
          finalAnswers[currentQuestion.id] = {
            questionId: currentQuestion.id,
            category: currentQuestion.category,
            numericalValue: defaultVal,
            calculatedCo2: co2,
          };
        }
      }

      const responsesArray = Object.values(finalAnswers);

      for (const q of questions) {
        if (!finalAnswers[q.id]) {
          const defaultVal = q.defaultValue || 0;
          responsesArray.push({
            questionId: q.id,
            category: q.category,
            numericalValue: defaultVal,
            calculatedCo2: calculateCo2(q, defaultVal),
          });
        }
      }

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: responsesArray }),
      });

      if (res.ok) {
        if (studentId) {
          localStorage.removeItem(`co2rechner_quiz_progress_${studentId}`);
        }
        router.push('/results');
      } else {
        setSubmitting(false);
      }
    } catch {
      setSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

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
        <p className="text-sm font-semibold text-muted-foreground">Fragebogen wird geladen...</p>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="paper-card w-full max-w-sm p-8 text-center space-y-4">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Abschnitt {categories.indexOf(currentCategory) + 1} von {categories.length}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {catInfo.label}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {categoryQuestions.length} kurze Fragen zu diesem Bereich.
          </p>
          <button
            onClick={() => setShowCategoryIntro(false)}
            className="w-full py-2.5 rounded-xl paper-btn-primary text-sm cursor-pointer"
          >
            Weiter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8 selection:bg-stone-200 dark:selection:bg-stone-800">
      {/* Top Header */}
      <header className="w-full border-b border-border/80 bg-background sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground tracking-wide uppercase">
              {catInfo.label}
            </span>
            <span className="font-mono text-muted-foreground">
              {currentIndex + 1} / {questions.length} ({totalProgress}%)
            </span>
          </div>

          {/* Minimalist Progress Line */}
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Question Box */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="paper-card p-6 sm:p-8 space-y-6">
          {/* Category Pill and Help Note */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              Frage {categoryIndex + 1} von {categoryQuestions.length}
            </span>

            {currentQuestion.helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Erklärung</span>
              </button>
            )}
          </div>

          {/* Help box */}
          {showHelp && currentQuestion.helpText && (
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground flex items-start gap-2.5">
              <p className="flex-1 leading-relaxed">{currentQuestion.helpText}</p>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
            {currentQuestion.questionText}
          </h2>

          {/* Inputs */}
          <div className="space-y-4 pt-2">
            {/* 1. SLIDER */}
            {currentQuestion.questionType === 'slider' && (
              <div className="space-y-6 py-2">
                <div className="text-center">
                  <span className="text-4xl font-extrabold font-mono text-foreground">
                    {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                  </span>
                  {currentQuestion.unit && (
                    <span className="text-sm font-semibold text-muted-foreground ml-2">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-10 h-10 rounded-xl paper-btn-secondary flex items-center justify-center font-bold cursor-pointer shrink-0"
                  >
                    <Minus className="w-4 h-4" />
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
                    className="w-10 h-10 rounded-xl paper-btn-secondary flex items-center justify-center font-bold cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>{currentQuestion.minValue ?? 0} {currentQuestion.unit}</span>
                  <span>{currentQuestion.maxValue ?? 100} {currentQuestion.unit}</span>
                </div>
              </div>
            )}

            {/* 2. NUMBER INPUT */}
            {currentQuestion.questionType === 'number' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-10 h-10 rounded-xl paper-btn-secondary flex items-center justify-center font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={currentQuestion.minValue ?? undefined}
                    max={currentQuestion.maxValue ?? undefined}
                    value={currentValue ?? ''}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 text-xl font-mono font-bold text-center rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-primary"
                  />
                  {currentQuestion.unit && (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-10 h-10 rounded-xl paper-btn-secondary flex items-center justify-center font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
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
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 font-semibold text-foreground'
                            : 'border-border bg-card hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-4 text-center">
                            {i + 1}.
                          </span>
                          <span className="text-sm sm:text-base leading-snug">{option.label}</span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>

          {/* Minimalist CO2 Hint */}
          {answers[currentQuestion.id] && (
            <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
              Entspricht ca.{' '}
              <strong className="text-foreground font-semibold">
                {formatCO2(answers[currentQuestion.id].calculatedCo2)}
              </strong>{' '}
              CO₂ pro Jahr.
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl paper-btn-secondary text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl paper-btn-primary text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Wird berechnet...' : 'Auswertung anzeigen'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2 rounded-xl paper-btn-primary text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              Weiter
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
