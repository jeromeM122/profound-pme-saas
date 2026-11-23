// Captures de l'interface RÉELLE de https://reeltobuild.com (version FR) avec Playwright.
// - Aucune requête POST n'atteint le serveur : la soumission d'un lien est interceptée et
//   mise en attente pour filmer l'état « Analyse en cours » sans lancer d'analyse.
// - Aucun site marchand n'est visité (les liens « Acheter chez » ne sont jamais cliqués).
// Usage : node scripts/capture.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'ui');
const URL = 'https://reeltobuild.com/?region=fr';
const DEMO_LINK = 'https://youtu.be/carrelage60';
const SLIDER_VALUES = [35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22];
fs.mkdirSync(OUT, { recursive: true });
const manifest = { capturedAt: new Date().toISOString(), source: URL, ruler: [] };

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
  await page.evaluate((visible) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.textContent.trim() === 'Faites-vous livrer') {
      let e = w.currentNode.parentElement;
      while (e && e !== document.body) { const pos = getComputedStyle(e).position; if (pos === 'fixed' || pos === 'sticky') { e.style.visibility = visible ? '' : 'hidden'; break; } e = e.parentElement; }
    }
  }, visible);
}

async function freshPage(browser) {
  const page = await browser.newPage({ viewport: { width: 400, height: 866 }, deviceScaleFactor: 3, locale: 'fr-FR' });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*{caret-color:transparent!important} ::-webkit-scrollbar{display:none}' });
  await page.waitForTimeout(1500);
  return page;
}

(async () => {
  const browser = await chromium.launch();

  // ---------- 1. Accueil + saisie du lien + analyse ----------
  let page = await freshPage(browser);
  await page.screenshot({ path: path.join(OUT, 'screen_home.png') }); console.log('✓ screen_home');
  let card = await tag(page, 'input', { startSel: 'input[type=url]', must: ['Coller le lien'], mustNot: ['Importer'] });
  await shot(card, 'input_empty', 12);
  await page.route('**/*', r => (r.request().method() !== 'GET' ? undefined : r.continue()));
  await page.locator('input[type=url]').fill(DEMO_LINK);
  await page.waitForTimeout(400);
  card = await tag(page, 'input', { startSel: 'input[type=url]', must: ['Extraire la liste'], mustNot: ['Importer'] });
  await shot(card, 'input_filled', 12);
  await page.locator('input[type=url]').press('Enter');
  const t0 = Date.now();
  for (const [i, at] of [[0, 1200], [1, 6500], [2, 13000], [3, 21000]]) {
    await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
    if (i === 0) {
      card = await tag(page, 'input', { startSel: 'input[type=url]', must: ['Analyse en cours'], mustNot: ['Importer'] });
      await shot(card, 'input_loading', 12);
    }
    const prog = await tag(page, 'prog', { startText: 'Lecture de la source', must: ['Comptez', 'Lecture de la source'] });
    await shot(prog, `progress_${i}`, 12);
  }
  await page.close();

  // ---------- 2. Exemple « Lot Sols » : liste, règle, calcul ----------
  page = await freshPage(browser);
  await page.getByRole('radio', { name: 'Lot Sols' }).click();
  await page.waitForFunction(() => /Budget estimé/.test(document.body.innerText), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await shot(await tag(page, 'head', { startText: 'Partager ce projet (Story / Reel / Pin)', must: ['Pose de carrelage', 'Lot Sols'], mustNot: ['Budget estimé', 'Liste de matériel'] }), 'project_header', 12);
  await shot(await tag(page, 'budget', { startText: 'Budget et chantier', must: ['Budget estimé', 'Adapter à mon chantier'] }), 'budget_card', 12);
  await page.getByRole('button', { name: 'Adapter à mon chantier' }).click();
  await page.waitForTimeout(800);
  await stickyBar(page, false);

  const rows = [
    ['row_carrelage', 'Carrelage grès cérame 60 x 60 cm'],
    ['row_plinthe', 'Plinthe carrelage assortie 8 x 60 cm'],
    ['row_mortier', 'Mortier-colle C2 sac 25 kg'],
    ['row_joint', 'Joint carrelage gris sac 5 kg'],
    ['row_primaire', "Primaire d'accrochage bidon 5 L"],
    ['row_croisillons', 'Croisillons 2 mm sachet de 200'],
    ['row_peigne', 'Peigne à colle denture 10 mm'],
  ];
  const rowTag = (id, name) => tag(page, id, { startSel: `label:${name}`, must: ['Voir le calcul'] });

  const slider = page.locator('input[type=range]').first();
  for (const v of SLIDER_VALUES) {
    await slider.fill(String(v));
    await page.waitForTimeout(900);
    const panel = await tag(page, 'panel', { startSel: 'input[type=range]', must: ['Surface au sol', 'Marge de perte'], mustNot: ['Budget estimé'] });
    await shot(panel, `ruler_${v}`, 0);
    await shot(await rowTag('rc', rows[0][1]), `ruler_row_carrelage_${v}`, 16);
    await shot(await rowTag('rm', rows[2][1]), `ruler_row_mortier_${v}`, 16);
    const info = await page.evaluate(() => {
      const t = document.body.innerText;
      return { budget: (t.match(/Budget estimé\n+([^\n]+)/) || [])[1], summary: (t.match(/Surface au sol [^\n]+/) || [])[0] };
    });
    manifest.ruler.push({ value: v, ...info });
    console.log('  ', v, info);
  }
  // Retour à la valeur de la vidéo pour la liste et le calcul
  await slider.fill('35'); await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Fermer les réglages' }).click().catch(() => {});
  await page.waitForTimeout(600);
  await shot(await tag(page, 'budget', { startText: 'Budget et chantier', must: ['Budget estimé', 'Adapter à mon chantier'] }), 'budget_card_35', 12);

  await shot(await tag(page, 'prep', { startText: 'Préparation du projet', must: ['validées', 'à confirmer'] }), 'prep_sols', 6);
  await shot(await tag(page, 'cat1', { startText: 'Sols, Murs & Faïences', nth: 1, must: ['Faïences', '€'], mustNot: ['Carrelage grès'] }), 'cat_sols', 4);
  await shot(await tag(page, 'cat2', { startText: 'Consommables de pose, Outils & Sécurité', nth: 1, must: ['Sécurité', '€'], mustNot: ['Mortier-colle'] }), 'cat_conso', 4).catch(e => console.log('cat2', e.message));
  for (const [id, name] of rows) await shot(await rowTag(id, name), id, 16);
  for (const label of ['ESTIMÉ', 'VALIDÉ']) {
    const b = await tag(page, 'badge', { startText: label, must: [label] });
    await shot(b, 'badge_' + (label === 'VALIDÉ' ? 'valide' : 'estime'), 3);
  }
  // Calcul détaillé (ligne carrelage)
  const rc = await rowTag('rcalc', rows[0][1]);
  await rc.locator('summary', { hasText: 'Voir le calcul' }).click();
  await page.waitForTimeout(700);
  await shot(await rowTag('rcalc', rows[0][1]), 'row_carrelage_calc', 16);
  await rc.locator('summary', { hasText: 'Voir le calcul' }).click();
  await page.waitForTimeout(400);

  // Liste complète, livraison, export
  await stickyBar(page, true);
  await shot(await tag(page, 'deliv', { startText: 'Faites-vous livrer', must: ['Faites-vous livrer', 'articles'] , mustNot: ['Préparation']}), 'delivery', 10);
  await shot(await tag(page, 'export', { startText: 'Exporter en CSV', must: ['Exporter en CSV', 'Copier la liste', 'Partager'], mustNot: ['Hypothèses'] }), 'export_bar', 10);
  await shot(await tag(page, 'hyp', { startText: 'Hypothèses de calcul', must: ['Hypothèses de calcul', 'Mortier-colle'] , mustNot: ['Exporter']}), 'hypotheses', 8).catch(e => console.log('hyp', e.message));
  const list = await tag(page, 'list', { startText: 'Liste de matériel', must: ['Liste de matériel', 'Exporter en CSV'] });
  await shot(list, 'list_full', 0);
  await page.close();

  // ---------- 3. Badge « À CONFIRMER » (exemple Peinture, ligne Bâche) ----------
  page = await freshPage(browser);
  await page.waitForTimeout(1500);
  await shot(await tag(page, 'badge', { startText: 'À CONFIRMER', must: ['À CONFIRMER'] }), 'badge_confirmer', 3);
  await shot(await tag(page, 'prep', { startText: 'Préparation du projet', must: ['validées', 'à confirmer'] }), 'prep_peinture', 6);
  await page.close();

  // ---------- 4. Logo du site ----------
  page = await freshPage(browser);
  await shot(page.locator('header a').first(), 'site_logo', 6);
  await page.close();

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
