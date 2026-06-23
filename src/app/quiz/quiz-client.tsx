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
  Flame,
} from 'lucide-react';
import { TiltCard } from '@/components/tilt-card';
import { MagneticButton } from '@/components/magnetic-button';

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
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const router = useRouter();

  // Define currentQuestion, currentValue and calculateCo2 first (needed for hooks below)
  const currentQuestion = questions[currentIndex];
  const currentValue = currentQuestion ? answers[currentQuestion.id]?.numericalValue : undefined;

  const calculateCo2 = useCallback(
    (question: QuizQuestion, value: number): number => {
      if (question.questionType === 'select' || question.questionType === 'radio') {
        return value * question.co2Factor;
      }
      return value * question.co2Factor;
    },
    []
  );

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

        setQuestions(data.questions);
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
            // ignore parse errors
          }
        }

        // Apply existing server-side responses
        if (data.responses?.length > 0 && !saved) {
          const existing: Record<string, Answer> = {};
          data.responses.forEach((r: { questionId: string; category: string; numericalValue: number; calculatedCo2: number }) => {
            existing[r.questionId] = {
              questionId: r.questionId,
              category: r.category,
              numericalValue: r.numericalValue,
              calculatedCo2: r.calculatedCo2,
            };
          });
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
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, currentIndex })
      );
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

  const currentCategory = currentQuestion?.category as Category;
  const categoryQuestions = getCategoryQuestions(currentCategory);
  const categoryIndex = categoryQuestions.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  const prevCategory =
    currentIndex > 0 ? questions[currentIndex - 1]?.category : null;
  const isNewCategory = prevCategory !== currentCategory;

  // Calculate running total CO2
  const runningTotalCo2 = Object.values(answers).reduce((sum, a) => sum + a.calculatedCo2, 0);

  const handleAnswer = useCallback((value: number, optionIndex?: number) => {
    if (!currentQuestion) return;
    const co2 = calculateCo2(currentQuestion, value);

    // Trigger selection animation
    setSelectedAnimation(currentQuestion.id);
    setTimeout(() => setSelectedAnimation(null), 400);

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

    // Auto-advance for select/radio questions on mobile/desktop after a short delay
    if (
      currentQuestion.questionType === 'select' ||
      currentQuestion.questionType === 'radio'
    ) {
      if (currentIndex < questions.length - 1) {
        setTimeout(() => {
          setDirection('next');
          const nextQ = questions[currentIndex + 1];
          if (nextQ && nextQ.category !== currentQuestion.category) {
            setShowCategoryIntro(true);
          }
          setCurrentIndex((prevIndex) => prevIndex + 1);
        }, 400);
      }
    }
  }, [currentQuestion, calculateCo2, currentIndex, questions, currentCategory]);

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
    // Ensure default value is registered in state if unanswered and has a default/min value
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
      setDirection('next');
      const nextQ = questions[currentIndex + 1];
      if (nextQ.category !== currentCategory) {
        setShowCategoryIntro(true);
      }
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    // Ensure default value is registered in state if unanswered and has a default/min value
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

    if (currentIndex > 0) {
      setDirection('prev');
      setShowCategoryIntro(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // First ensure the current last question's default value is registered if not answered
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

      // For unanswered questions, use default values
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
      }
    } catch {
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    }
    setSubmitting(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input field
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (loading || !currentQuestion) return;

      // Select / Radio option shortcuts: 1, 2, 3, 4...
      if (
        currentQuestion.questionType === 'select' ||
        currentQuestion.questionType === 'radio'
      ) {
        if (currentQuestion.options) {
          const numKey = parseInt(e.key);
          const optionsArray = currentQuestion.options as { label: string; value: number }[];
          if (!isNaN(numKey) && numKey >= 1 && numKey <= optionsArray.length) {
            const selectedOption = optionsArray[numKey - 1];
            handleAnswer(selectedOption.value, numKey - 1);
          }
        }
      }

      // Slider step shortcuts: ArrowLeft / ArrowRight
      if (currentQuestion.questionType === 'slider') {
        if (e.key === 'ArrowLeft') {
          handleDecrement();
        } else if (e.key === 'ArrowRight') {
          handleIncrement();
        }
      }

      // Quiz navigation shortcuts
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Fragen werden geladen...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const totalProgress = Math.round(
    (Object.keys(answers).length / questions.length) * 100
  );

  // Category progress for SVG donut
  const catAnswered = categoryQuestions.filter((q) => answers[q.id]).length;
  const catTotal = categoryQuestions.length;
  const catProgress = catTotal > 0 ? catAnswered / catTotal : 0;
  const donutRadius = 14;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference * (1 - catProgress);

  // Category intro screen
  if (showCategoryIntro && isNewCategory) {
    const catInfo = CATEGORIES[currentCategory];
    const catQuestions = getCategoryQuestions(currentCategory);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        </div>
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-6">{catInfo.icon}</div>
          <h2 className="text-3xl font-bold mb-3">{catInfo.label}</h2>
          <p className="text-muted-foreground mb-2">
            {catQuestions.length} Fragen in dieser Kategorie
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Kategorie{' '}
            {categories.indexOf(currentCategory) + 1} von{' '}
            {categories.length}
          </p>
          <button
            onClick={() => setShowCategoryIntro(false)}
            className={`px-8 py-3 rounded-xl bg-gradient-to-r ${catInfo.gradient} text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300`}
          >
            Los geht&apos;s!
          </button>
        </div>
      </div>
    );
  }

  const catInfo = CATEGORIES[currentCategory];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-20 glass-strong border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {/* SVG Donut Progress Ring */}
              <div className="relative w-9 h-9 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r={donutRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/60"
                  />
                  <circle
                    cx="18" cy="18" r={donutRadius}
                    fill="none"
                    stroke={catInfo.color}
                    strokeWidth="3"
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={donutOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs">
                  {catInfo.icon}
                </span>
              </div>

              <div>
                <span className="text-sm font-semibold block leading-tight">{catInfo.label}</span>
                <span className="text-[10px] text-muted-foreground">{categoryIndex + 1}/{categoryQuestions.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live CO₂ Ticker */}
              <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-1.5" title="Dein aktueller geschätzter CO₂-Wert basierend auf bisherigen Antworten">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-mono font-bold gradient-text">
                  {formatCO2(runningTotalCo2)}
                </span>
              </div>

              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div className="flex h-full">
              {categories.map((cat) => {
                const catQs = getCategoryQuestions(cat);
                const answered = catQs.filter((q) => answers[q.id]).length;
                const width = (catQs.length / questions.length) * 100;
                const fillPercent =
                  catQs.length > 0 ? (answered / catQs.length) * 100 : 0;

                return (
                  <div
                    key={cat}
                    className="h-full relative"
                    style={{ width: `${width}%` }}
                  >
                    <div
                      className="h-full transition-all duration-500 ease-out rounded-full"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: CATEGORIES[cat].color,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-muted-foreground">
              {totalProgress}% beantwortet
            </span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <TiltCard
          key={currentQuestion.id}
          className="rounded-3xl shadow-xl animate-slide-up"
          intensity={4}
          scale={1.01}
        >
          <div className="glass-strong rounded-3xl p-6 sm:p-8">
            {/* Category badge */}
            <div className="flex items-center justify-between mb-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${catInfo.gradient} text-white`}
              >
                {catInfo.icon} {catInfo.label} – Frage {categoryIndex + 1}/
                {categoryQuestions.length}
              </div>
              {currentQuestion.helpText && (
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Help text */}
            {showHelp && currentQuestion.helpText && (
              <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground animate-fade-in flex items-start gap-2">
                <HelpCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{currentQuestion.helpText}</span>
                <button onClick={() => setShowHelp(false)} className="shrink-0 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Question text */}
            <h2 className="text-xl sm:text-2xl font-bold mb-8 leading-snug">
              {currentQuestion.questionText}
            </h2>

            {/* Input area */}
            <div className="space-y-3">
              {/* SLIDER type */}
              {currentQuestion.questionType === 'slider' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-4xl font-bold gradient-text text-glow transition-all duration-300">
                      {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                    </span>
                    {currentQuestion.unit && (
                      <span className="text-lg text-muted-foreground ml-2">
                        {currentQuestion.unit}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="w-10 h-10 rounded-full glass hover:bg-muted/70 flex items-center justify-center font-bold text-lg select-none cursor-pointer active:scale-90 transition-transform shrink-0"
                      title="Wert verringern"
                    >
                      –
                    </button>
                    <input
                      type="range"
                      min={currentQuestion.minValue ?? 0}
                      max={currentQuestion.maxValue ?? 100}
                      step={currentQuestion.step ?? 1}
                      value={
                        currentValue ??
                        currentQuestion.defaultValue ??
                        currentQuestion.minValue ??
                        0
                      }
                      onChange={(e) => handleAnswer(parseFloat(e.target.value))}
                      className="slider-premium flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-10 h-10 rounded-full glass hover:bg-muted/70 flex items-center justify-center font-bold text-lg select-none cursor-pointer active:scale-90 transition-transform shrink-0"
                      title="Wert erhöhen"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {currentQuestion.minValue ?? 0} {currentQuestion.unit}
                    </span>
                    <span>
                      {currentQuestion.maxValue ?? 100} {currentQuestion.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* NUMBER type */}
              {currentQuestion.questionType === 'number' && (
                <div className="text-center">
                  <input
                    type="number"
                    min={currentQuestion.minValue ?? undefined}
                    max={currentQuestion.maxValue ?? undefined}
                    value={currentValue ?? ''}
                    onChange={(e) => handleAnswer(parseFloat(e.target.value) || 0)}
                    className="w-32 px-4 py-3 text-2xl font-bold text-center rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {currentQuestion.unit && (
                    <span className="text-lg text-muted-foreground ml-3">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>
              )}

              {/* SELECT / RADIO type */}
              {(currentQuestion.questionType === 'select' ||
                currentQuestion.questionType === 'radio') &&
                currentQuestion.options && (
                  <div className="space-y-2.5 stagger-children">
                    {(
                      currentQuestion.options as { label: string; value: number }[]
                    ).map((option, i) => {
                      const isSelected =
                        answers[currentQuestion.id]?.optionIndex !== undefined
                          ? answers[currentQuestion.id]?.optionIndex === i
                          : currentValue === option.value &&
                            (currentQuestion.options as { label: string; value: number }[]).findIndex(o => o.value === currentValue) === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(option.value, i)}
                          className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ripple-effect cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 dark:bg-primary/5 shadow-md shadow-primary/10 scale-[1.01]'
                              : 'border-border hover:border-primary/40 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                                isSelected
                                  ? 'border-primary bg-primary scale-110'
                                  : 'border-muted-foreground/30'
                                }`}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-white animate-scale-in" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* CO₂ impact preview for current answer */}
            {answers[currentQuestion.id] && (
              <div className="mt-6 p-3 rounded-xl bg-muted/30 border border-border/30 flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>
                  Diese Antwort: <span className="font-mono font-bold text-foreground">{formatCO2(answers[currentQuestion.id].calculatedCo2)}</span> CO₂/Jahr
                </span>
              </div>
            )}
          </div>
        </TiltCard>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <MagneticButton
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all cursor-pointer"
            strength={6}
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </MagneticButton>

          {isLastQuestion ? (
            <MagneticButton
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all duration-300 cursor-pointer"
              strength={8}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {submitting ? 'Speichern...' : 'Auswertung anzeigen'}
            </MagneticButton>
          ) : (
            <MagneticButton
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 cursor-pointer"
              strength={8}
            >
              Weiter
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          )}
        </div>

        {/* Skip to end */}
        {Object.keys(answers).length === questions.length && !isLastQuestion && (
          <div className="text-center mt-4 animate-fade-in">
            <button
              onClick={() => setCurrentIndex(questions.length - 1)}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Alle Fragen beantwortet – zur Auswertung springen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
