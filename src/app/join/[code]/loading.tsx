import { LegalFooter } from '@/components/legal-footer';

export default function JoinLoading() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <span className="font-serif text-sm font-semibold text-foreground">CO₂-Rechner</span>
          <span className="text-muted-foreground uppercase tracking-widest text-[11px]">Direktzugang</span>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center text-center">
        <article className="paper-sheet p-8 space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider animate-pulse">
            Direktzugang wird geladen...
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
