'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type Category, formatCO2 } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  HelpCircle,
  X,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { ParticleField } from '@/components/particle-field';

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

  // Load questions
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

        // Restore saved progress scoped by studentId
        const storageKey = `co2rechner_quiz_progress_${data.studentId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || {});
            setCurrentIndex(parsed.currentIndex || 0);
            setShowCategoryIntro(false);
          } catch {
            // ignore parse error
          }
        }

        // Apply existing server-side responses
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

  // Save progress to localStorage
  useEffect(() => {
    if (studentId && questions.length > 0 && Object.keys(answers).length > 0) {
      const storageKey = `co2rechner_quiz_progress_${studentId}`;
      localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex }));
    }
  }, [answers, currentIndex, questions.length, studentId]);

  // Automatically pre-fill default values for slider/number questions when visited
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

  // Running total CO2
  const runningTotalCo2 = Object.values(answers).reduce((sum, a) => sum + a.calculatedCo2, 0);

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

      // Auto-advance for multiple choice questions with a gentle, friendly pause
      if (currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') {
        if (currentIndex < questions.length - 1) {
          setTimeout(() => {
            const nextQ = questions[currentIndex + 1];
            if (nextQ && nextQ.category !== currentQuestion.category) {
              setShowCategoryIntro(true);
            }
            setCurrentIndex((prevIndex) => prevIndex + 1);
            setShowHelp(false);
          }, 350);
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
    // Ensure default value is set if unanswered
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      // Select / Radio 1-9 shortcuts
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

      // Slider step shortcuts
      if (currentQuestion.questionType === 'slider') {
        if (e.key === 'ArrowLeft') handleDecrement();
        if (e.key === 'ArrowRight') handleIncrement();
      }

      // Quiz navigation
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
        <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mb-4 text-emerald-600 animate-bounce">
          <Leaf className="w-7 h-7" />
        </div>
        <p className="font-bold text-base text-foreground">Lade dein Klima-Quiz...</p>
        <p className="text-xs text-muted-foreground mt-1">Einen kleinen Moment bitte!</p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const totalProgress = Math.round(
    ((currentIndex + 1) / questions.length) * 100
  );

  // Growth mascot stages
  const getGrowthStage = () => {
    if (totalProgress < 33) return { icon: '🌱', label: 'Super Start!' };
    if (totalProgress < 75) return { icon: '🌿', label: 'Halbzeit geschafft!' };
    return { icon: '🌳', label: 'Fast am Ziel!' };
  };
  const growth = getGrowthStage();

  // Category info
  const catInfo = CATEGORIES[currentCategory] || {
    label: 'Klima',
    icon: '🌍',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-500',
  };
  const isLastQuestion = currentIndex === questions.length - 1;

  // Category Intro Intermission
  if (showCategoryIntro && isNewCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <ParticleField />
        <div className="bg-card w-full max-w-md rounded-3xl p-8 border-2 border-emerald-500/20 shadow-xl text-center animate-scale-in">
          <div className="text-6xl mb-4 select-none animate-bounce-soft">{catInfo.icon}</div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Neue Kategorie ({categories.indexOf(currentCategory) + 1} von {categories.length})
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-foreground">
            {catInfo.label}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {categoryQuestions.length} Fragen über deine Gewohnheiten in diesem Bereich.
          </p>
          <button
            onClick={() => setShowCategoryIntro(false)}
            className="w-full py-3.5 px-6 rounded-2xl gradient-primary text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all btn-bounce cursor-pointer flex items-center justify-center gap-2"
          >
            Los geht&apos;s! 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative pb-8">
      <ParticleField />

      {/* Top Bar with Living Mascot & Progress */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* Category badge */}
            <div className="flex items-center gap-2">
              <span className="text-xl select-none">{catInfo.icon}</span>
              <div>
                <span className="text-sm font-bold block text-foreground leading-tight">
                  {catInfo.label}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Frage {categoryIndex + 1} von {categoryQuestions.length}
                </span>
              </div>
            </div>

            {/* Growth indicator & Question count */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <span className="text-sm">{growth.icon}</span>
                <span>{growth.label}</span>
              </div>

              <div className="px-3 py-1 rounded-xl bg-muted/60 text-xs font-bold text-foreground font-mono">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* Clean Rounded Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex">
            {categories.map((cat) => {
              const catQs = getCategoryQuestions(cat);
              const answered = catQs.filter((q) => answers[q.id]).length;
              const width = (catQs.length / questions.length) * 100;
              const fillPercent = catQs.length > 0 ? (answered / catQs.length) * 100 : 0;

              return (
                <div key={cat} className="h-full relative border-r border-background/20" style={{ width: `${width}%` }}>
                  <div
                    className="h-full transition-all duration-400 ease-out rounded-full"
                    style={{
                      width: `${fillPercent}%`,
                      backgroundColor: CATEGORIES[cat]?.color || '#10b981',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Question Card Area */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-border shadow-lg animate-scale-in">
          {/* Header row in card */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: catInfo.color }}
            >
              {catInfo.icon} {catInfo.label}
            </span>

            {currentQuestion.helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer"
                aria-label="Tipp anzeigen"
              >
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">Tipp</span>
              </button>
            )}
          </div>

          {/* Help hint box */}
          {showHelp && currentQuestion.helpText && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm text-foreground animate-fade-in flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="flex-1 leading-relaxed">{currentQuestion.helpText}</p>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-muted-foreground cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-8 text-foreground leading-snug tracking-tight">
            {currentQuestion.questionText}
          </h2>

          {/* Input Types */}
          <div className="space-y-4 mb-6">
            {/* 1. SLIDER QUESTION */}
            {currentQuestion.questionType === 'slider' && (
              <div className="space-y-6">
                {/* Big tactile number display */}
                <div className="text-center py-2">
                  <div className="inline-flex items-baseline gap-2 px-6 py-2 rounded-3xl bg-muted/40 border border-border">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                      {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                    </span>
                    {currentQuestion.unit && (
                      <span className="text-base sm:text-lg font-bold text-muted-foreground">
                        {currentQuestion.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Range Slider & chunky buttons */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted-foreground/15 active:scale-90 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                    aria-label="Wert verringern"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <input
                    type="range"
                    min={currentQuestion.minValue ?? 0}
                    max={currentQuestion.maxValue ?? 100}
                    step={currentQuestion.step ?? 1}
                    value={currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                    className="slider-friendly flex-1"
                    aria-label={currentQuestion.questionText}
                  />

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted-foreground/15 active:scale-90 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                    aria-label="Wert erhöhen"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Min / Max bounds */}
                <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
                  <span>
                    Min: {currentQuestion.minValue ?? 0} {currentQuestion.unit}
                  </span>
                  <span>
                    Max: {currentQuestion.maxValue ?? 100} {currentQuestion.unit}
                  </span>
                </div>
              </div>
            )}

            {/* 2. NUMBER INPUT QUESTION */}
            {currentQuestion.questionType === 'number' && (
              <div className="flex items-center justify-center gap-3 py-4">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted-foreground/15 active:scale-90 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
                  aria-label="Wert verringern"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={currentQuestion.minValue ?? undefined}
                    max={currentQuestion.maxValue ?? undefined}
                    value={currentValue ?? ''}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-3 text-2xl font-bold text-center rounded-2xl bg-muted/40 border-2 border-border focus:border-emerald-500 font-mono text-foreground focus:outline-none"
                  />
                  {currentQuestion.unit && (
                    <span className="text-base font-bold text-muted-foreground">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-12 h-12 rounded-2xl bg-muted hover:bg-muted-foreground/15 active:scale-90 text-foreground flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
                  aria-label="Wert erhöhen"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* 3. SELECT / RADIO CARDS */}
            {(currentQuestion.questionType === 'select' || currentQuestion.questionType === 'radio') &&
              currentQuestion.options && (
                <div className="space-y-2.5 stagger-children">
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
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer btn-bounce ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-md shadow-emerald-500/10'
                            : 'border-border bg-card hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`text-sm sm:text-base font-semibold leading-snug ${
                              isSelected ? 'text-foreground font-bold' : 'text-foreground/90'
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500 text-white scale-105'
                              : 'border-border bg-transparent'
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

          {/* Child-friendly CO2 impact preview */}
          {answers[currentQuestion.id] && (
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
              <span className="text-sm select-none">🍃</span>
              <span>
                Verursacht ca.{' '}
                <strong className="text-foreground font-bold">
                  {formatCO2(answers[currentQuestion.id].calculatedCo2)}
                </strong>{' '}
                CO₂ pro Jahr
              </span>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all cursor-pointer btn-bounce"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-base shadow-lg shadow-emerald-500/25 hover:opacity-95 disabled:opacity-50 transition-all btn-bounce cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {submitting ? 'Speichere...' : 'Auswertung ansehen 🎉'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-primary text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all btn-bounce cursor-pointer"
            >
              Weiter
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
