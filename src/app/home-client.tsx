'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { TiltCard } from '@/components/tilt-card';
import { MagneticButton } from '@/components/magnetic-button';
import { ScrollReveal } from '@/components/scroll-reveal';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(
  () => import('@/components/particle-field').then((mod) => mod.ParticleField),
  { ssr: false }
);
import {
  Leaf,
  ArrowRight,
  TreePine,
  Zap,
  ShoppingBag,
  UtensilsCrossed,
  Target,
  Trophy,
  Award,
  Sparkles,
  Users,
  BarChart3,
} from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

const CLIMATE_FACTS = [
  { emoji: '✈️', text: 'Ein Hin- und Rückflug nach Mallorca erzeugt so viel CO₂ wie 6 Monate vegetarische Ernährung.' },
  { emoji: '🥩', text: '1 kg Rindfleisch verursacht 13 kg CO₂ – das entspricht 65 km Autofahrt.' },
  { emoji: '🌳', text: 'Ein einzelner Baum absorbiert ca. 12,5 kg CO₂ pro Jahr – du bräuchtest ~730 Bäume für den deutschen Durchschnitt.' },
  { emoji: '🚗', text: 'Fahrgemeinschaften können bis zu 50% der täglichen Mobilitäts-Emissionen einsparen.' },
  { emoji: '👕', text: 'Die Fast-Fashion-Industrie verursacht 10% der globalen CO₂-Emissionen – mehr als Luft- und Schifffahrt zusammen.' },
  { emoji: '🌡️', text: 'Jedes Grad weniger Heizung spart ca. 6% Heizenergie – und senkt deinen CO₂-Fußabdruck messbar.' },
  { emoji: '📱', text: 'Streaming in HD für 1 Stunde erzeugt ca. 36g CO₂ – an 365 Tagen so viel wie 13 km Autofahrt.' },
];

export default function HomePage() {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);
  const [stats, setStats] = useState({ totalCompleted: 0, totalSchools: 0, totalClasses: 0 });
  const [animatedCount, setAnimatedCount] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Track mouse for parallax in hero
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch public stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch {
        // ignore
      }
    }
    fetchStats();
  }, []);

  // Animate counter
  useEffect(() => {
    if (stats.totalCompleted === 0) return;
    const target = stats.totalCompleted;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedCount(target);
        clearInterval(timer);
      } else {
        setAnimatedCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [stats.totalCompleted]);

  // Rotate climate facts
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % CLIMATE_FACTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Fehler beim Anmelden.'); setLoading(false); return; }
      router.push(data.isCompleted ? '/results' : '/quiz');
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      setLoading(false);
    }
  };

  const formatKey = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
    return clean;
  };

  // Parallax offsets based on mouse position
  const parallaxX = (mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.02;
  const parallaxY = (mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.02;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive particle canvas */}
      <ParticleField />

      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950" />
        {/* Mouse-reactive gradient orbs */}
        <div
          className="absolute w-[500px] h-[500px] bg-emerald-400/15 dark:bg-emerald-400/5 rounded-full blur-3xl transition-transform duration-[2000ms] ease-out"
          style={{ transform: `translate(${parallaxX * 3}px, ${parallaxY * 3}px)`, left: '10%', top: '-10%' }}
        />
        <div
          className="absolute w-[400px] h-[400px] bg-teal-400/15 dark:bg-teal-400/5 rounded-full blur-3xl transition-transform duration-[2500ms] ease-out"
          style={{ transform: `translate(${-parallaxX * 2}px, ${-parallaxY * 2}px)`, right: '15%', bottom: '10%' }}
        />
        <div
          className="absolute w-[350px] h-[350px] bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl transition-transform duration-[3000ms] ease-out"
          style={{ transform: `translate(${parallaxX * 1.5}px, ${-parallaxY * 1.5}px)`, right: '30%', top: '25%' }}
        />
        <div
          className="absolute w-[250px] h-[250px] bg-purple-400/10 dark:bg-purple-400/3 rounded-full blur-3xl transition-transform duration-[2200ms] ease-out"
          style={{ transform: `translate(${-parallaxX * 2.5}px, ${parallaxY * 2}px)`, left: '20%', bottom: '20%' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <MagneticButton as="div" className="flex items-center gap-2.5" strength={5}>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-glow-pulse">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            CO<span className="text-xs align-super">2</span> Rechner
          </span>
        </MagneticButton>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MagneticButton
            as="a"
            href="/login"
            className="px-4 py-2 text-sm font-medium rounded-xl glass hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
            strength={6}
          >
            Anmelden
          </MagneticButton>
        </div>
      </nav>

      {/* Hero */}
      <main ref={heroRef} className="relative z-10 flex flex-col items-center justify-center px-6 pt-10 pb-8 md:pt-16 max-w-5xl mx-auto">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-8 shimmer-border animate-slide-up"
            style={{ transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px)` }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Für Umweltmentoren an Schulen
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up"
            style={{
              animationDelay: '0.1s',
              transform: `translate(${parallaxX * 0.15}px, ${parallaxY * 0.15}px)`,
            }}
          >
            Was ist dein
            <br />
            <span className="gradient-text text-glow">CO₂-Fußabdruck</span>
            <span className="text-emerald-500">?</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{
              animationDelay: '0.2s',
              transform: `translate(${parallaxX * 0.1}px, ${parallaxY * 0.1}px)`,
            }}
          >
            Finde in nur 10 Minuten heraus, wie viel CO₂ du pro Jahr verursachst.
            Vergleiche dich mit dem Durchschnitt und entdecke, wo du am meisten bewirken kannst.
          </p>
        </div>

        {/* Access Key Input */}
        <div className="w-full max-w-md animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <form onSubmit={handleSubmit} className="relative">
            <TiltCard className="rounded-2xl" intensity={6} scale={1.01}>
              <div className="glass-strong rounded-2xl p-2 shadow-2xl shadow-emerald-500/10 shimmer-border">
                <div className="flex items-center gap-2">
                  <input
                    id="access-key-input"
                    type="text"
                    placeholder="XXXX-XXXX"
                    value={accessKey}
                    onChange={(e) => setAccessKey(formatKey(e.target.value))}
                    maxLength={9}
                    className="flex-1 px-4 py-3.5 text-lg font-mono tracking-widest text-center bg-transparent rounded-xl placeholder:text-muted-foreground/40 focus:outline-none"
                    autoComplete="off"
                  />
                  <MagneticButton
                    type="submit"
                    disabled={accessKey.length < 9 || loading}
                    className="px-5 py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    strength={10}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Start
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </TiltCard>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400 text-center animate-fade-in">{error}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Gib deinen Zugangscode ein, den du von deiner Lehrkraft erhalten hast.
          </p>
        </div>

        {/* Live Stats Counter */}
        {stats.totalCompleted > 0 && (
          <ScrollReveal animation="scaleIn" delay={200} className="mt-8">
            <div className="glass rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg shadow-emerald-500/5">
              <div className="flex -space-x-1.5">
                {['🌍', '🌱', '🍃'].map((e, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${['from-emerald-400 to-teal-500', 'from-cyan-400 to-blue-500', 'from-purple-400 to-pink-500'][i]} flex items-center justify-center text-[10px] text-white font-bold border-2 border-background`}>{e}</div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold gradient-text">{animatedCount}+</span>
                <span className="text-muted-foreground"> Schüler:innen haben bereits teilgenommen</span>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Category cards – TiltCards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 w-full max-w-3xl">
          {[
            { icon: <TreePine className="w-6 h-6" />, label: 'Mobilität', color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', desc: 'Wie bewegst du dich?' },
            { icon: <UtensilsCrossed className="w-6 h-6" />, label: 'Ernährung', color: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20', desc: 'Was isst du täglich?' },
            { icon: <Zap className="w-6 h-6" />, label: 'Energie', color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20', desc: 'Wie heizt & stromst du?' },
            { icon: <ShoppingBag className="w-6 h-6" />, label: 'Konsum', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20', desc: 'Wie viel kaufst du?' },
          ].map((cat, i) => (
            <ScrollReveal key={cat.label} animation="slideUp" delay={i * 100}>
              <TiltCard className="rounded-2xl" intensity={15} scale={1.04}>
                <div className="glass rounded-2xl p-5 text-center group cursor-default h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mx-auto mb-3 shadow-lg ${cat.shadow} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-white">{cat.icon}</span>
                  </div>
                  <span className="text-sm font-semibold block">{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{cat.desc}</span>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* "So funktioniert's" Stepper */}
        <ScrollReveal animation="slideUp" delay={100} className="mt-20 w-full max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            So funktioniert&apos;s
          </h2>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] h-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30" />
            {[
              { step: 1, icon: <Users className="w-5 h-5" />, title: 'Code eingeben', desc: 'Erhalte deinen persönlichen Zugangscode von deiner Lehrkraft und melde dich hier an.', gradient: 'from-emerald-500 to-teal-500' },
              { step: 2, icon: <BarChart3 className="w-5 h-5" />, title: 'Quiz beantworten', desc: 'Beantworte Fragen zu Mobilität, Ernährung, Energie und Konsum – in nur 10 Minuten.', gradient: 'from-teal-500 to-cyan-500' },
              { step: 3, icon: <Trophy className="w-5 h-5" />, title: 'Ergebnisse vergleichen', desc: 'Sieh deinen CO₂-Fußabdruck, vergleiche mit deiner Klasse und erstelle deine Klima-Urkunde.', gradient: 'from-cyan-500 to-blue-500' },
            ].map((item, i) => (
              <ScrollReveal key={item.step} animation="slideUp" delay={i * 150 + 200}>
                <TiltCard className="rounded-2xl" intensity={10}>
                  <div className="flex flex-col items-center text-center relative p-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg mb-4 z-10`}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">{item.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* "Warum mitmachen?" Section */}
        <ScrollReveal animation="slideUp" className="mt-20 w-full max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Warum mitmachen?
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto text-sm">
            Der CO₂-Rechner macht Klimaschutz zum Teamerlebnis – für dich und deine ganze Klasse.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <Target className="w-6 h-6" />, title: 'Verstehe deinen Fußabdruck', desc: 'Analysiere deinen persönlichen CO₂-Ausstoß in 4 Kategorien und erhalte individuelle Tipps zur Verbesserung.', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/10' },
              { icon: <Trophy className="w-6 h-6" />, title: 'Werde Teil der Challenge', desc: 'Vergleiche dich mit deiner Klasse im schulweiten Leaderboard und schaltet gemeinsam Klassen-Abzeichen frei.', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/10' },
              { icon: <Award className="w-6 h-6" />, title: 'Erhalte deine Urkunde', desc: 'Gib dein persönliches Klima-Versprechen ab und drucke deine eigene Klimaschutz-Urkunde aus.', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/10' },
            ].map((item, i) => (
              <ScrollReveal key={item.title} animation={i === 0 ? 'slideLeft' : i === 2 ? 'slideRight' : 'slideUp'} delay={i * 100}>
                <TiltCard className="rounded-2xl h-full" intensity={10} scale={1.03}>
                  <div className="glass-strong rounded-2xl p-6 group h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white">{item.icon}</span>
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* Rotating Climate Facts */}
        <ScrollReveal animation="scaleIn" className="mt-16 w-full max-w-2xl">
          <TiltCard className="rounded-2xl" intensity={5} scale={1.01}>
            <div className="glass-strong rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Wusstest du?</span>
              </div>
              <div className="min-h-[48px] flex items-center" key={currentFact}>
                <span className="text-2xl mr-3 flex-shrink-0">{CLIMATE_FACTS[currentFact].emoji}</span>
                <p className="text-sm leading-relaxed animate-fade-in">{CLIMATE_FACTS[currentFact].text}</p>
              </div>
              <div className="flex justify-center gap-1.5 mt-4">
                {CLIMATE_FACTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentFact(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentFact ? 'bg-emerald-500 w-4' : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </TiltCard>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal animation="fadeIn" delay={200} className="mt-14">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { value: '60', label: 'Fragen' },
              { value: '~10 Min', label: 'Dauer' },
              { value: '4', label: 'Kategorien' },
              { value: '100%', label: 'Anonym' },
            ].map((stat) => (
              <MagneticButton key={stat.label} as="div" className="text-center cursor-default" strength={4}>
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </MagneticButton>
            ))}
          </div>
        </ScrollReveal>
      </main>

      <LegalFooter />
    </div>
  );
}
