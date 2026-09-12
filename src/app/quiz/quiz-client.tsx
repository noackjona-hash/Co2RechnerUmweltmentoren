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
  const [quizMode, setQuizMode] = useState<number>(10);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const currentValue = currentQuestion ? answers[currentQuestion.id]?.numericalValue : undefined;

  const calculateCo2 = useCallback((question: QuizQuestion, value: number): number => {
    return value * question.co2Factor;
  }, []);

  const loadQuestions = useCallback(async (modeOverride?: number) => {
    try {
      setLoading(true);
      const url = modeOverride ? `/api/quiz?mode=${modeOverride}` : '/api/quiz';
      const res = await fetch(url);
      const data = await res.json();

      if (data.isCompleted) {
        router.push('/results');
        return;
      }

      const qList: QuizQuestion[] = data.questions || [];
      setQuestions(qList);
      setStudentId(data.studentId);
      setIsGuest(data.isGuest || false);
      if (data.quizMode) {
        setQuizMode(Number(data.quizMode));
      }

      const storageKey = `co2rechner_quiz_progress_${data.studentId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved && !modeOverride) {
        try {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers || {});
          setCurrentIndex(parsed.currentIndex || 0);
          setShowCategoryIntro(false);
        } catch {
          /* ignore */
        }
      } else if (data.responses?.length > 0 && !saved) {
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
    } catch (err) {
      console.error('Failed to load questions:', err);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleModeChange = async (newMode: number) => {
    if (newMode === quizMode) return;
    setCurrentIndex(0);
    setShowCategoryIntro(true);
    await loadQuestions(newMode);
  };

  // Save progress locally
  useEffect(() => {
    if (studentId && questions.length > 0 && Object.keys(answers).length > 0) {
      const storageKey = `co2rechner_quiz_progress_${studentId}`;
      localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex }));
    }
  }, [answers, currentIndex, questions.length, studentId]);

  // Ensure current question has an initial answer populated
  useEffect(() => {
    if (loading || !currentQuestion) return;

    if (answers[currentQuestion.id] === undefined) {
      let defaultVal = currentQuestion.defaultValue;
      let optionIndex: number | undefined = undefined;

      if (currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') {
        const opts = currentQuestion.options as { label: string; value: number }[] | null;
        if (opts && Array.isArray(opts) && opts.length > 0) {
          defaultVal = defaultVal ?? opts[0].value;
          optionIndex = opts.findIndex((o) => o.value === defaultVal);
          if (optionIndex === -1) optionIndex = 0;
        }
      } else {
        defaultVal = defaultVal ?? currentQuestion.minValue ?? 0;
      }

      if (defaultVal !== null && defaultVal !== undefined) {
        const initialAns: Answer = {
          questionId: currentQuestion.id,
          category: currentQuestion.category,
          numericalValue: defaultVal,
          calculatedCo2: calculateCo2(currentQuestion, defaultVal),
          optionIndex,
        };
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: initialAns,
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

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Build final responses array guaranteed to include all questions
      const finalResponses = questions.map((q) => {
        const existing = answers[q.id];
        if (existing && existing.numericalValue !== undefined) {
          return {
            questionId: q.id,
            category: q.category,
            numericalValue: existing.numericalValue,
            calculatedCo2: existing.calculatedCo2,
          };
        }

        let fallbackVal = q.defaultValue;
        if (q.questionType === 'select' || q.questionType === 'radio') {
          const opts = q.options as { label: string; value: number }[] | null;
          if (opts && Array.isArray(opts) && opts.length > 0) {
            fallbackVal = fallbackVal ?? opts[0].value;
          }
        } else {
          fallbackVal = fallbackVal ?? q.minValue ?? 0;
        }
        const val = fallbackVal ?? 0;
        return {
          questionId: q.id,
          category: q.category,
          numericalValue: val,
          calculatedCo2: calculateCo2(q, val),
        };
      });

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: finalResponses,
          complete: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Fehler beim Übermitteln des Fragebogens.');
      }

      if (studentId) {
        localStorage.removeItem(`co2rechner_quiz_progress_${studentId}`);
      }

      router.push('/results');
    } catch (err: any) {
      console.error('Submit error:', err);
      alert(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setSubmitting(false);
    }
  }, [answers, questions, studentId, router, calculateCo2, submitting]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      if (nextQ && nextQ.category !== currentQuestion?.category) {
        setShowCategoryIntro(true);
      }
      setShowHelp(false);
      setCurrentIndex((prev) => prev + 1);
    } else if (currentIndex === questions.length - 1) {
      handleSubmit();
    }
  }, [currentIndex, questions, currentQuestion, handleSubmit]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setShowHelp(false);
      setShowCategoryIntro(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
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
        <div className="paper-sheet w-full max-w-md p-6 sm:p-10 space-y-6">
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
              className="w-full paper-btn-primary text-xs sm:text-sm font-medium"
            >
              Abschnitt beginnen →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      {/* Minimal Header & Progress Line */}
      <header className="w-full border-b border-border bg-background sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {isGuest ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] px-1.5 py-0.5 border border-border rounded text-muted-foreground font-mono">
                  Gast
                </span>
                <div className="flex items-center border border-border rounded overflow-hidden text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleModeChange(10)}
                    className={`px-2 py-0.5 font-mono cursor-pointer transition-colors ${
                      quizMode === 10
                        ? 'bg-foreground text-background font-semibold'
                        : 'bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    10Q
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(30)}
                    className={`px-2 py-0.5 font-mono border-l border-border cursor-pointer transition-colors ${
                      quizMode === 30
                        ? 'bg-foreground text-background font-semibold'
                        : 'bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    30Q
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange(60)}
                    className={`px-2 py-0.5 font-mono border-l border-border cursor-pointer transition-colors ${
                      quizMode === 60
                        ? 'bg-foreground text-background font-semibold'
                        : 'bg-background hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    60Q
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-muted-foreground hidden sm:inline">Bereich:</span>
              <span className="font-medium text-foreground truncate">
                {catInfo.label}
              </span>
            </div>
          </div>
          <span className="text-muted-foreground font-mono text-[11px] shrink-0 ml-2">
            {currentIndex + 1} / {questions.length}
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
      <main className="max-w-xl w-full mx-auto px-4 py-6 sm:py-12 flex-1 flex flex-col justify-center pb-24 sm:pb-8">
        <article className="paper-sheet p-5 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground">
            <span className="font-mono text-[11px]">
              {catInfo.label} · Frage {categoryIndex + 1} / {categoryQuestions.length}
            </span>

            {currentQuestion.helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-xs transition-colors p-1"
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
                className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-lg sm:text-2xl font-medium text-foreground leading-snug tracking-tight">
            {currentQuestion.questionText}
          </h2>

          {/* Inputs Section */}
          <div className="space-y-4 pt-1">
            {/* 1. SLIDER */}
            {currentQuestion.questionType === 'slider' && (
              <div className="space-y-6 py-2">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-mono font-semibold text-foreground">
                    {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                  </span>
                  {currentQuestion.unit && (
                    <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-12 h-12 border border-border rounded-xl hover:bg-muted active:scale-95 flex items-center justify-center cursor-pointer shrink-0 text-foreground transition-all"
                    aria-label="Verringern"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 px-1">
                    <input
                      type="range"
                      min={currentQuestion.minValue ?? 0}
                      max={currentQuestion.maxValue ?? 100}
                      step={currentQuestion.step ?? 1}
                      value={currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                      onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                      className="slider-paper w-full h-6 flex items-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-12 h-12 border border-border rounded-xl hover:bg-muted active:scale-95 flex items-center justify-center cursor-pointer shrink-0 text-foreground transition-all"
                    aria-label="Erhöhen"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between text-[11px] text-muted-foreground font-mono px-1">
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
                  className="w-12 h-12 border border-border rounded-xl hover:bg-muted active:scale-95 flex items-center justify-center cursor-pointer text-foreground transition-all"
                  aria-label="Verringern"
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
                    className="w-28 h-12 text-xl font-mono font-medium text-center border border-border rounded-xl bg-background text-foreground focus:outline-none focus:border-foreground"
                  />
                  {currentQuestion.unit && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-12 h-12 border border-border rounded-xl hover:bg-muted active:scale-95 flex items-center justify-center cursor-pointer text-foreground transition-all"
                  aria-label="Erhöhen"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 3. MULTIPLE CHOICE */}
            {(currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') &&
              currentQuestion.options && (
                <div className="space-y-2.5">
                  {(currentQuestion.options as { label: string; value: number }[]).map((option, i) => {
                    const isSelected =
                      answers[currentQuestion.id]?.optionIndex !== undefined
                        ? answers[currentQuestion.id]?.optionIndex === i
                        : currentValue === option.value;

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswer(option.value, i)}
                        className={`w-full text-left min-h-[50px] sm:min-h-[54px] p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer text-xs sm:text-sm active:scale-[0.99] ${
                          isSelected
                            ? 'border-foreground bg-muted font-medium text-foreground ring-1 ring-foreground'
                            : 'border-border bg-background hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="leading-snug">{option.label}</span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
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
      </main>

      {/* Mobile-First Sticky Bottom Action Bar */}
      <div className="fixed sm:static bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-md sm:bg-transparent border-t border-border sm:border-0 p-3 sm:p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="paper-btn-secondary text-xs sm:text-sm px-4 min-w-[85px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück</span>
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="paper-btn-primary text-xs sm:text-sm flex-1 sm:flex-initial px-5 font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Wird ausgewertet...' : 'Auswertung anzeigen'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="paper-btn-primary text-xs sm:text-sm flex-1 sm:flex-initial px-5 font-semibold"
            >
              <span>Weiter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
