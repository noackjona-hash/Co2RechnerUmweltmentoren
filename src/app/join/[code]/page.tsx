import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { LegalFooter } from '@/components/legal-footer';

export const dynamic = 'force-dynamic';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;

  if (!code) {
    redirect('/');
  }

  // Normalize code: uppercase, format as XXXX-XXXX
  let normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.length === 8) {
    normalized = `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
  }

  const student = await prisma.student.findUnique({
    where: { accessKey: normalized },
    include: {
      class: {
        include: {
          license: true,
        },
      },
    },
  });

  if (student && student.class.license.isActive) {
    await setSession({
      id: student.id,
      role: 'student',
      classId: student.classId,
      accessKey: student.accessKey,
    });

    redirect(student.isCompleted ? '/results' : '/quiz');
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background">
      <header className="w-full border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between font-mono text-xs">
          <Link href="/" className="paper-btn-secondary text-xs">
            <ArrowLeft className="w-3 h-3" />
            <span>Zur Startseite</span>
          </Link>
          <span className="font-serif text-sm font-semibold text-foreground">CO₂-Rechner</span>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <article className="paper-sheet p-6 sm:p-8 space-y-5 text-center">
          <div className="border-b border-border pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span>Direktzugang</span>
            <span>Status: Fehler</span>
          </div>

          <div className="w-10 h-10 border border-destructive/40 bg-destructive/5 text-destructive rounded-sm mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-serif font-normal text-foreground">
              Ungültiger Einladungslink
            </h1>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Der Zugangscode <strong className="font-mono text-foreground">{code}</strong> ist leider nicht gültig oder die Lizenz der zugehörigen Schule ist nicht mehr aktiv.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/" className="paper-btn-primary w-full text-xs">
              Code manuell eingeben →
            </Link>
          </div>
        </article>
      </main>

      <LegalFooter />
    </div>
  );
}
