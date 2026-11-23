import { createContext, useContext } from 'react';
import dataFr from './data-fr.json';
import dataUs from './data-us.json';

export type LocaleId = 'fr' | 'us';
type Data = {
  ruler: { value: number; x: number; y: number; w: number; h: number; budget: string }[];
  rows: Record<string, { h: number; w: number; compact: number }>;
  inputpos: { x: number; y: number; w: number; h: number; homeW: number; homeH: number };
};

export type Locale = {
  id: LocaleId;
  dir: string; // dossier des captures dans public/
  data: Data;
  calcLines: number[];
  focus: { refs: [number, number]; buy: [number, number]; buyTag: number }; // cadres de la ligne carrelage (px capture) // centres (px capture) des lignes surlignées dans « Voir le calcul »
  tiles: [number, number]; // carreaux à la valeur de la vidéo → valeur finale
  tilesUnit: string;
  areaUnit: string;
  budgetLabel: string;
  t: {
    problemA: string;
    problemB: string;
    tutoKicker: string;
    tutoTitle: string;
    questions: [string, string, string];
    paste: string;
    pillLabel: string;
    demoLink: string;
    transform: string;
    transformSub: string;
    tags: [string, string, string];
    ruler: string;
    trust: string;
    badges: [string, string, string];
    result: string;
    resultSub: string;
    sig1: string;
    sig2: string;
    tryAt: string;
    coverTitle: string;
    coverSub: string;
    short: { paste: string; transform: string; ruler: string };
  };
};

export const LOCALES: Record<LocaleId, Locale> = {
  fr: {
    id: 'fr',
    dir: 'ui',
    data: dataFr,
    calcLines: [1500, 1727, 1825, 2120],
    focus: { refs: [418, 372], buy: [808, 142], buyTag: 760 },
    tiles: [112, 71],
    tilesUnit: 'carreaux',
    areaUnit: 'm²',
    budgetLabel: 'Budget',
    t: {
      problemA: 'Vous avez trouvé *le tuto.*',
      problemB: 'Mais savez-vous *quoi acheter ?*',
      tutoKicker: 'Tuto rénovation',
      tutoTitle: 'Poser du carrelage 60 × 60 dans une pièce',
      questions: ['Combien de carreaux ?', 'Quel mortier-colle ?', 'Quels outils ?'],
      paste: 'Collez simplement *le lien.*',
      pillLabel: 'LIEN DU TUTO COPIÉ',
      demoLink: 'https://youtu.be/carrelage60',
      transform: 'Votre tutoriel devient une *liste de courses détaillée.*',
      transformSub: 'Exemple réel : pose de carrelage au sol 60 × 60 cm',
      tags: ['Quantité calculée', 'Références produit', "Où l'acheter"],
      ruler: 'Adaptez les quantités à vos *dimensions réelles.*',
      trust: "Comprenez d'où viennent *les quantités.*",
      badges: ['Quantité nommée ou vue dans la source', 'Rendement ou conditionnement non sourcé', 'Un contrôle a relevé une incohérence'],
      result: 'Votre projet est prêt à *passer à l’action.*',
      resultSub: 'Budget et quantités estimés : à vérifier avant achat.',
      sig1: 'De la vidéo au',
      sig2: 'projet.',
      tryAt: 'Essayez gratuitement sur',
      coverTitle: 'Du tuto à la *liste d’achats.*',
      coverSub: 'Matériaux, outils et quantités adaptés à vos dimensions.',
      short: {
        paste: 'Collez le lien *d’un tuto.*',
        transform: 'Obtenez la *liste d’achats détaillée.*',
        ruler: 'Adaptée à vos *dimensions réelles.*',
      },
    },
  },
  us: {
    id: 'us',
    dir: 'ui-us',
    data: dataUs,
    calcLines: [1505, 1726, 1815, 2069],
    focus: { refs: [405, 345], buy: [762, 140], buyTag: 712 },
    tiles: [109, 69],
    tilesUnit: 'tiles',
    areaUnit: 'sqft',
    budgetLabel: 'Budget',
    t: {
      problemA: 'You found *the tutorial.*',
      problemB: 'But do you know *what to buy?*',
      tutoKicker: 'DIY tutorial',
      tutoTitle: 'Laying 24 × 24 in floor tile in a room',
      questions: ['How many tiles?', 'Which thinset?', 'What tools?'],
      paste: 'Just paste *the link.*',
      pillLabel: 'TUTORIAL LINK COPIED',
      demoLink: 'https://youtu.be/tilefloor24',
      transform: 'Your tutorial becomes a *detailed shopping list.*',
      transformSub: 'Real example: laying 24 × 24 in porcelain floor tile',
      tags: ['Calculated quantity', 'Product references', 'Where to buy'],
      ruler: 'Scale quantities to *your actual space.*',
      trust: 'See where *every quantity comes from.*',
      badges: ['Quantity named or seen in the source', 'Coverage or pack size not sourced', 'A check found an inconsistency'],
      result: 'Your project is *ready to go.*',
      resultSub: 'Budget and quantities are estimates: check before you buy.',
      sig1: 'From video to',
      sig2: 'project.',
      tryAt: 'Try it free at',
      coverTitle: 'From tutorial to *shopping list.*',
      coverSub: 'Materials, tools and quantities sized to your space.',
      short: {
        paste: 'Paste a link *to any tutorial.*',
        transform: 'Get a *detailed shopping list.*',
        ruler: 'Sized to *your actual space.*',
      },
    },
  },
};

export const LocaleCtx = createContext<Locale>(LOCALES.fr);
export const useL = () => useContext(LocaleCtx);
