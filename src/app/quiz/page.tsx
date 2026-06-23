'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type Category } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  HelpCircle,
  X,
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
}

const STORAGE_KEY = 'co2rechner_quiz_progress';

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCategoryIntro, setShowCategoryIntro] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const router = useRouter();

  // Load questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        setQuestions(data.questions);

        // Restore saved progress
        const saved = localStorage.getItem(STORAGE_KEY);
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
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, currentIndex })
      );
    }
  }, [answers, currentIndex, questions.length]);

  const currentQuestion = questions[currentIndex];
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

  // Calculate CO2 for a response
  const calculateCo2 = useCallback(
    (question: QuizQuestion, value: number): number => {
      if (question.questionType === 'select' || question.questionType === 'radio') {
        // The value from options already contains the CO2 value
        return value * question.co2Factor;
      }
      // For slider/number, multiply value by factor
      return value * question.co2Factor;
    },
    []
  );

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    const co2 = calculateCo2(currentQuestion, value);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        category: currentQuestion.category,
        numericalValue: value,
        calculatedCo2: co2,
      },
    }));
  };

  const goNext = () => {
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
    if (currentIndex > 0) {
      setDirection('prev');
      setShowCategoryIntro(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const responsesArray = Object.values(answers);

      // For unanswered questions, use default values
      for (const q of questions) {
        if (!answers[q.id]) {
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
        localStorage.removeItem(STORAGE_KEY);
        router.push('/results');
      }
    } catch {
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    }
    setSubmitting(false);
  };

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

  const currentValue = answers[currentQuestion.id]?.numericalValue;

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
          <div className={`text-6xl mb-6`}>{catInfo.icon}</div>
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
            <div className="flex items-center gap-2">
              <span className="text-lg">{catInfo.icon}</span>
              <span className="text-sm font-semibold">{catInfo.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Frage {currentIndex + 1} / {questions.length}
            </span>
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
        <div
          key={currentQuestion.id}
          className={`glass-strong rounded-3xl p-6 sm:p-8 shadow-xl animate-slide-up`}
        >
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
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
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
              <button onClick={() => setShowHelp(false)} className="shrink-0">
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
                  <span className="text-4xl font-bold gradient-text">
                    {currentValue ?? currentQuestion.defaultValue ?? currentQuestion.minValue ?? 0}
                  </span>
                  {currentQuestion.unit && (
                    <span className="text-lg text-muted-foreground ml-2">
                      {currentQuestion.unit}
                    </span>
                  )}
                </div>
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
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-muted [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
                />
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
                <div className="space-y-2.5">
                  {(
                    currentQuestion.options as { label: string; value: number }[]
                  ).map((option, i) => {
                    const isSelected = currentValue === option.value;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/10 dark:bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
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
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all duration-300"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {submitting ? 'Speichern...' : 'Auswertung anzeigen'}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              Weiter
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skip to end */}
        {Object.keys(answers).length === questions.length && !isLastQuestion && (
          <div className="text-center mt-4 animate-fade-in">
            <button
              onClick={() => setCurrentIndex(questions.length - 1)}
              className="text-sm text-primary hover:underline"
            >
              Alle Fragen beantwortet – zur Auswertung springen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
