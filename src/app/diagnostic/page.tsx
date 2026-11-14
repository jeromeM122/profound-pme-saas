import type { Metadata } from 'next'
import { QuizFlow } from '@/components/quiz/QuizFlow'

export const metadata: Metadata = {
  title: 'Diagnostic capillaire',
  description: 'Texture, porosité, cuir chevelu, objectifs : ton profil capillaire en 60 secondes.',
}

export default function DiagnosticPage() {
  return (
    <section className="min-h-[100svh] px-4 pt-28 pb-20">
      <QuizFlow />
    </section>
  )
}
