// Captures de l'interface RÉELLE de https://reeltobuild.com avec Playwright (version FR ou US).
// - Aucune requête POST n'atteint le serveur : la soumission d'un lien est interceptée et
//   mise en attente pour filmer l'état « Analyse en cours » sans lancer d'analyse.
// - Aucun site marchand n'est visité (les liens « Acheter chez » ne sont jamais cliqués).
// Usage : node scripts/capture.js [fr|us]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LOCALES = {
  fr: {
    out: 'ui', url: 'https://reeltobuild.com/?region=fr', locale: 'fr-FR', demoLink: 'https://youtu.be/carrelage60',
    slider: [35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22],
    paste: 'Coller le lien', extract: 'Extraire la liste', analyzing: 'Analyse en cours', importTxt: 'Importer',
    step1: 'Lecture de la source', takes: 'Comptez',
    trade: 'Lot Sols', title: 'Pose de carrelage', share: 'Partager ce projet (Story / Reel / Pin)',
    budgetTitle: 'Budget et chantier', budget: 'Budget estimé', pricesLoading: 'Estimation des prix', fit: 'Adapter à mon chantier', close: 'Fermer les réglages',
    panel: ['Surface au sol', 'Marge de perte'], area: 'Surface au sol', list: 'Liste de matériel',
    rows: [
      ['row_carrelage', 'Carrelage grès cérame 60 x 60 cm'],
      ['row_plinthe', 'Plinthe carrelage assortie 8 x 60 cm'],
      ['row_mortier', 'Mortier-colle C2 sac 25 kg'],
      ['row_joint', 'Joint carrelage gris sac 5 kg'],
      ['row_primaire', "Primaire d'accrochage bidon 5 L"],
      ['row_croisillons', 'Croisillons 2 mm sachet de 200'],
      ['row_peigne', 'Peigne à colle denture 10 mm'],
    ],
    calc: 'Voir le calcul', prep: 'Préparation du projet', prepMust: ['validées', 'à confirmer'],
    cat1: ['Sols, Murs & Faïences', 'Faïences'], cat2: ['Consommables de pose, Outils & Sécurité', 'Sécurité'], money: '€',
    estimated: 'ESTIMÉ', validated: 'VALIDÉ', confirm: 'À CONFIRMER',
    deliv: ['Faites-vous livrer', 'articles'], exportBtns: ['Exporter en CSV', 'Copier la liste', 'Partager'],
    hyp: ['Hypothèses de calcul', 'Mortier-colle'],
  },
  us: {
    out: 'ui-us', url: 'https://reeltobuild.com/?region=us', locale: 'en-US', demoLink: 'https://youtu.be/tilefloor24',
    slider: [377, 360, 350, 340, 330, 320, 310, 300, 290, 280, 270, 260, 250, 240],
    paste: 'Paste the link', extract: 'Extract the list', analyzing: 'Analyzing', importTxt: 'Import',
    step1: 'Reading the source', takes: '10 to 40 seconds',
    trade: 'Flooring', title: 'Laying 24 x 24 in', share: 'Share this project (Story / Reel / Pin)',
    budgetTitle: 'Budget and job', budget: 'Estimated budget', pricesLoading: 'Estimating prices', fit: 'Fit to my job', close: 'Close settings',
    panel: ['Floor area', 'Waste allowance'], area: 'Floor area', list: 'Supply list',
    rows: [
      ['row_carrelage', 'Porcelain floor tile 24 x 24 in'],
      ['row_plinthe', 'Porcelain bullnose trim 3 x 24 in'],
      ['row_mortier', 'Polymer-modified thinset 50 lb'],
      ['row_joint', 'Sanded tile grout gray 10 lb'],
      ['row_primaire', 'Floor primer 1 gal'],
      ['row_croisillons', 'Tile spacers 1/16 in bag of 200'],
      ['row_peigne', 'Notched trowel 3/8 in'],
    ],
    calc: 'See the calculation', prep: 'Project readiness', prepMust: ['validated', 'to confirm'],
    cat1: ['Floors, walls & tiles', 'tiles'], cat2: ['Installation supplies, tools & safety', 'safety'], money: '$',
    estimated: 'ESTIMATED', validated: 'VALIDATED', confirm: 'TO CONFIRM',
    deliv: ['Get it delivered', 'items'], exportBtns: ['Export CSV', 'Copy the list', 'Share'],
    hyp: ['Calculation assumptions', 'Thinset'],
  },
};
const LOC = process.argv[2] || 'fr';
const L = LOCALES[LOC];
const OUT = path.join(__dirname, '..', 'public', L.out);
const URL = L.url;
fs.mkdirSync(OUT, { recursive: true });
const manifest = { locale: LOC, capturedAt: new Date().toISOString(), source: URL, ruler: [] };

// Marque le plus petit ancêtre de `startSel` (ou de l'élément contenant `startText`)
// dont le texte contient toutes les chaînes `must` (et aucune de `mustNot`).
async function tag(page, id, { startSel, startText, must = [], mustNot = [], nth = 0 }) {
  const ok = await page.evaluate(({ id, startSel, startText, must, mustNot, nth }) => {
    document.querySelectorAll(`[data-cap="${id}"]`).forEach(e => e.removeAttribute('data-cap'));
    const N = x => (x || '').normalize('NFC').replace(/[\u00a0\u202f]/g, ' ');
    let starts = [];
    if (startSel && startSel.startsWith('label:')) starts = [...document.querySelectorAll('[role=checkbox]')].filter(e => N(e.getAttribute('aria-label')) === N(startSel.slice(6)));
    else if (startSel) starts = [...document.querySelectorAll(startSel)];
    else {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) if (N(w.currentNode.textContent.trim()).toUpperCase() === N(startText).toUpperCase()) starts.push(w.currentNode.parentElement);
    }
    const s = starts[nth];
    if (!s) return false;
    let e = s;
    while (e && e !== document.body) {
      const t = N(e.innerText);
      if (must.every(m => t.includes(N(m))) && !mustNot.some(m => t.includes(N(m)))) { e.setAttribute('data-cap', id); return true; }
      e = e.parentElement;
    }
    return false;
  }, { id, startSel, startText, must, mustNot, nth });
  if (!ok) throw new Error('tag failed: ' + id);
  return page.locator(`[data-cap="${id}"]`);
}

async function shot(loc, name, pad = 0) {
  const file = path.join(OUT, name + '.png');
  if (pad) {
    await loc.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await loc.page().waitForTimeout(150);
    const bb = await loc.boundingBox();
    await loc.page().screenshot({ path: file, clip: { x: bb.x - pad, y: bb.y - pad, width: bb.width + pad * 2, height: bb.height + pad * 2 } });
  } else await loc.screenshot({ path: file });
  console.log('✓', name);
}

async function stickyBar(page, visible) {
  await page.evaluate(([visible, label]) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.textContent.trim() === label) {
      let e = w.currentNode.parentElement;
      while (e && e !== document.body) { const pos = getComputedStyle(e).position; if (pos === 'fixed' || pos === 'sticky') { e.style.visibility = visible ? '' : 'hidden'; break; } e = e.parentElement; }
    }
  }, [visible, L.deliv[0]]);
}

async function freshPage(browser) {
  const page = await browser.newPage({ viewport: { width: 400, height: 866 }, deviceScaleFactor: 3, locale: L.locale });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*{caret-color:transparent!important} ::-webkit-scrollbar{display:none}' });
  await page.waitForTimeout(2000);
  return page;
}

const pricesReady = (page) => page.waitForFunction(([b, l]) => document.body.innerText.includes(b) && !document.body.innerText.includes(l), [L.budget, L.pricesLoading], { timeout: 45000 });

(async () => {
  const browser = await chromium.launch();

  // ---------- 1. Accueil + saisie du lien + analyse ----------
  let page = await freshPage(browser);
  await page.screenshot({ path: path.join(OUT, 'screen_home.png') }); console.log('✓ screen_home');
  let card = await tag(page, 'input', { startSel: 'input[type=url]', must: [L.paste], mustNot: [L.importTxt] });
  await shot(card, 'input_empty', 12);
  await page.route('**/*', r => (r.request().method() !== 'GET' ? undefined : r.continue()));
  await page.locator('input[type=url]').fill(L.demoLink);
  await page.waitForTimeout(400);
  card = await tag(page, 'input', { startSel: 'input[type=url]', must: [L.extract], mustNot: [L.importTxt] });
  await shot(card, 'input_filled', 12);
  await page.locator('input[type=url]').press('Enter');
  const t0 = Date.now();
  for (const [i, at] of [[0, 1200], [1, 6500], [2, 13000], [3, 21000]]) {
    await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
    if (i === 0) {
      card = await tag(page, 'input', { startSel: 'input[type=url]', must: [L.analyzing], mustNot: [L.importTxt] });
      await shot(card, 'input_loading', 12);
    }
    const prog = await tag(page, 'prog', { startText: L.step1, must: [L.takes, L.step1] });
    await shot(prog, `progress_${i}`, 12);
  }
  await page.close();

  // ---------- 2. Exemple carrelage : liste, calcul, export (valeur de la vidéo) ----------
  page = await freshPage(browser);
  await page.getByRole('radio', { name: L.trade }).click();
  await page.waitForFunction((t) => document.body.innerText.includes(t), L.title);
  await pricesReady(page);
  await page.waitForTimeout(1500);
  await shot(await tag(page, 'head', { startText: L.share, must: [L.title, L.trade], mustNot: [L.budget, L.list] }), 'project_header', 12);
  await shot(await tag(page, 'budget', { startText: L.budgetTitle, must: [L.budget, L.fit] }), 'budget_card', 12);
  fs.copyFileSync(path.join(OUT, 'budget_card.png'), path.join(OUT, `budget_card_${L.slider[0]}.png`));
  await stickyBar(page, false);
  const rowTag = (id, name) => tag(page, id, { startSel: `label:${name}`, must: [L.calc] });

  await shot(await tag(page, 'prep', { startText: L.prep, must: L.prepMust }), 'prep_sols', 6);
  await shot(await tag(page, 'cat1', { startText: L.cat1[0], nth: 1, must: [L.cat1[1], L.money], mustNot: [L.rows[0][1]] }), 'cat_sols', 4);
  await shot(await tag(page, 'cat2', { startText: L.cat2[0], nth: 1, must: [L.cat2[1], L.money], mustNot: [L.rows[2][1]] }), 'cat_conso', 4).catch(e => console.log('cat2', e.message));
  for (const [id, name] of L.rows) await shot(await rowTag(id, name), id, 16);
  await shot(await tag(page, 'badge', { startText: L.estimated, must: [L.estimated] }), 'badge_estime', 3);
  await shot(await tag(page, 'badge', { startText: L.validated, must: [L.validated] }), 'badge_valide', 3);
  const rc = await rowTag('rcalc', L.rows[0][1]);
  await rc.locator('summary', { hasText: L.calc }).click();
  await page.waitForTimeout(700);
  await shot(await rowTag('rcalc', L.rows[0][1]), 'row_carrelage_calc', 16);
  await rc.locator('summary', { hasText: L.calc }).click();
  await page.waitForTimeout(400);
  await stickyBar(page, true);
  await shot(await tag(page, 'deliv', { startText: L.deliv[0], must: L.deliv, mustNot: [L.prep] }), 'delivery', 10);
  await shot(await tag(page, 'export', { startText: L.exportBtns[0], must: L.exportBtns, mustNot: [L.hyp[0]] }), 'export_bar', 10);
  await shot(await tag(page, 'hyp', { startText: L.hyp[0], must: L.hyp, mustNot: [L.exportBtns[0]] }), 'hypotheses', 8).catch(e => console.log('hyp', e.message));
  await shot(await tag(page, 'list', { startText: L.list, must: [L.list, L.exportBtns[0]] }), 'list_full', 0);

  // ---------- 3. Règle graduée : une capture par valeur ----------
  await page.getByRole('button', { name: L.fit }).click();
  await page.waitForTimeout(800);
  await stickyBar(page, false);
  const slider = page.locator('input[type=range]').first();
  for (const [k, v] of L.slider.entries()) {
    if (k > 0) await slider.fill(String(v)); // la 1re valeur est celle de la vidéo (non modifiée)
    await page.waitForTimeout(1200);
    const panel = await tag(page, 'panel', { startSel: 'input[type=range]', must: L.panel, mustNot: [L.budget] });
    await shot(panel, `ruler_${v}`, 0);
    await shot(await rowTag('rc', L.rows[0][1]), `ruler_row_carrelage_${v}`, 16);
    await shot(await rowTag('rm', L.rows[2][1]), `ruler_row_mortier_${v}`, 16);
    const info = await page.evaluate(([b, a]) => {
      const t = document.body.innerText.replace(/[  ]/g, ' ');
      return { budget: (t.match(new RegExp(b + '\\n+([^\\n]+)')) || [])[1], summary: (t.match(new RegExp(a + ' [^\\n]+')) || [])[0] };
    }, [L.budget, L.area]);
    manifest.ruler.push({ value: v, ...info });
    console.log('  ', v, info);
  }
  await page.close();

  // ---------- 4. Badge « à confirmer » (exemple Peinture, affiché par défaut) ----------
  page = await freshPage(browser);
  await shot(await tag(page, 'badge', { startText: L.confirm, must: [L.confirm] }), 'badge_confirmer', 3);
  await shot(await tag(page, 'prep', { startText: L.prep, must: L.prepMust }), 'prep_peinture', 6);
  await page.close();

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
