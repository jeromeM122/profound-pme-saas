import type { Diagnostic } from './engine'

/** General, non-medical care guidance derived from the diagnostic (pure, deterministic). */
export function routineTips(d: Diagnostic): { title: string; text: string }[] {
  const tips: { title: string; text: string }[] = []
  switch (d.porosity) {
    case 'HIGH':
      tips.push({ title: 'Scelle l’hydratation', text: 'Tes cheveux boivent vite et perdent vite l’eau : superpose un soin sans rinçage, puis une huile ou un beurre pour garder l’hydratation (méthode LOC / LCO).' })
      break
    case 'LOW':
      tips.push({ title: 'Mise sur la légèreté', text: 'Les soins ont du mal à pénétrer : privilégie des textures légères et une chaleur douce (bonnet chauffant) pendant tes masques.' })
      break
    case 'MEDIUM':
      tips.push({ title: 'Garde l’équilibre', text: 'Ta fibre absorbe bien : alterne soins hydratants et protéinés selon le ressenti de tes longueurs.' })
      break
    case 'UNKNOWN':
      tips.push({ title: 'Teste ta porosité', text: 'Observe le temps de séchage après un lavage, ou dépose un cheveu propre dans un verre d’eau : s’il coule vite, ta porosité est plutôt haute.' })
      break
  }
  const family = d.textureCode[0]
  if (family === '3' || family === '4') {
    tips.push({ title: 'Démêle mouillé', text: 'Démêle uniquement sur cheveux humides et enduits de soin, des pointes vers les racines, pour limiter la casse.' })
  } else if (family === '2') {
    tips.push({ title: 'Respecte tes ondulations', text: 'Évite de brosser à sec : applique tes produits en « scrunchant » pour définir les vagues sans les alourdir.' })
  } else {
    tips.push({ title: 'Évite d’alourdir', text: 'Concentre les soins sur les longueurs et les pointes, et garde les racines légères.' })
  }
  if (d.scalp === 'OILY') tips.push({ title: 'Cuir chevelu', text: 'Un shampoing doux régulier vaut mieux qu’un décapant : il évite l’effet rebond.' })
  if (d.scalp === 'DRY' || d.scalp === 'SENSITIVE')
    tips.push({ title: 'Cuir chevelu', text: 'Choisis des formules sans parfum agressif et masse en douceur. Si l’inconfort persiste, demande l’avis d’un professionnel de santé.' })
  return tips
}
