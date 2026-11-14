import type { Metadata } from 'next'
import { QuizFlow } from '@/components/quiz/QuizFlow'

export const metadata: Metadata = {
  title: 'Diagnostic capillaire',
  description: 'Texture, porosité, cuir chevelu, objectifs : ton profil capillaire en 60 secondes.',
}

export default async function DiagnosticPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const fromScan = (await searchParams).from === 'scan'
  return (
    <section className="min-h-[100svh] px-4 pt-14 pb-20">
      {fromScan && (
        <p className="mx-auto mb-6 max-w-2xl rounded-2xl bg-champagne px-4 py-3 text-sm">
          Texture détectée par le scan : elle est déjà renseignée. Tu peux la modifier en revenant à l’étape 1.
        </p>
      )}
      <QuizFlow />
    </section>
  )
}
