// Capture du site réel https://routines.tresser.fr en vue mobile (390×844, @3x).
// Deux variantes :
//   members : le site tel quel (photos des membres visibles) — à publier uniquement
//             après accord écrit des membres pour un usage publicitaire.
//   masked  : photos de profil, hero et tuiles remplacés à la volée par des aplats
//             de la charte Tresser + icône de texture. Le reste (noms, textures,
//             produits, commentaires, quiz) est strictement l'interface réelle.
// Usage : node capture/capture.mjs [members|masked|all]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconSvg } from './icons.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE = 'https://routines.tresser.fr';
const VW = 390, VH = 844, DSF = 3;

const QUIZ = { tex: 'frises', concern: 'Définition', need: 'definir' };

function placeholderProfile(w, h, tex) {
  const s = Math.min(w, h) * 0.42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="100%" height="100%" fill="#E9EBDF"/>
<g transform="translate(${(w - s * 1.1) / 2} ${(h - s) / 2}) scale(${s / 40})" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" opacity=".82">${iconSvg(tex)}</g></svg>`;
}
function placeholderTile(w, h, bg, fg, op = .16) {
  // aplat de la charte + fines lignes de texture, le texte blanc du site reste lisible
  let lines = '';
  for (let i = 0; i < 9; i++) lines += `<g transform="translate(${(i + .5) * w / 9 - 22} ${h * .08}) scale(${h * .84 / 40})">${iconSvg(['crepus', 'frises', 'boucles', 'locs', 'multi'][i % 5])}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="100%" height="100%" fill="${bg}"/><g fill="none" stroke="${fg}" stroke-linecap="round" opacity="${op}">${lines}</g></svg>`;
}

async function run(variant) {
  const out = path.join(ROOT, 'public', 'captures', variant);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: VW, height: VH }, deviceScaleFactor: DSF, isMobile: true, hasTouch: true,
    colorScheme: 'light', locale: 'fr-FR',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  // jamais de mesure d'audience pendant la capture
  await ctx.route(/google-analytics|googletagmanager|doubleclick/, r => r.abort());
  let profiles = null;
  if (variant === 'masked') {
    await ctx.route(/\/img\/(profils|tuiles)\/|\/img\/hero\.jpg/, async route => {
      const u = new URL(route.request().url()).pathname;
      let svg;
      if (u.includes('/profils/')) {
        const id = path.basename(u).replace(/\.\w+$/, '');
        const p = profiles?.find(x => x.id === id);
        svg = placeholderProfile(p?.img?.w || 800, p?.img?.h || 1000, p?.tex?.[0] || 'multi');
      } else if (u.includes('hero')) svg = placeholderTile(736, 1104, '#3366FF', '#fff', .07);
      else svg = placeholderTile(736, 980, '#1d1e19', '#fff');
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svg });
    });
  }
  const page = await ctx.newPage();
  // données réelles des profils (servent aussi aux placeholders)
  const html = execFileSync('curl', ['-s', SITE + '/'], { encoding: 'utf8' });
  profiles = JSON.parse(html.match(/id="data">([\s\S]*?)<\/script>/)[1]).profiles;
  fs.writeFileSync(path.join(ROOT, 'src', 'data', 'profiles.json'), JSON.stringify(profiles, null, 2));

  const settle = async () => { await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400); };
  const loadAll = async () => {
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 300) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.evaluate(() => Promise.race([new Promise(r => setTimeout(r, 8000)), Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))]));
    await page.evaluate(() => window.scrollTo(0, 0)); await settle();
  };
  const boxes = async (sel, mapFn) => page.$$eval(sel, (els, f) => els.map(e => {
    const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height, t: (e.innerText || '').trim().split('\n')[0] };
  }), mapFn);
  const meta = {};
  const shot = async (name, opts = {}) => { await page.screenshot({ path: path.join(out, name + '.png'), ...opts }); };

  // ---------- Accueil ----------
  await page.goto(SITE + '/', { waitUntil: 'load', timeout: 30000 });
  const refuse = page.getByRole('button', { name: 'Refuser' });
  if (await refuse.isVisible().catch(() => false)) await refuse.click();
  await settle(); await loadAll();
  await shot('home_top');
  await shot('home_full', { fullPage: true });
  meta.home = {
    height: await page.evaluate(() => document.documentElement.scrollHeight),
    cards: await boxes('#wall article'),
    names: await page.$$eval('#wall article', els => els.map(e => e.querySelector('.pseudo')?.textContent.trim())),
    quizTile: (await boxes('#wall [data-open-quiz]'))[0],
    filters: (await boxes('#filters'))[0],
    share: (await boxes('#partager'))[0],
    headerQuiz: (await boxes('header a[href="/#quiz"], .top a[href="/#quiz"]'))[0],
  };
  // barre de filtres dans son état « collé »
  await page.evaluate(y => window.scrollTo(0, y + 400), meta.home.filters.y); await page.waitForTimeout(500);
  meta.home.filtersStuck = (await page.$eval('#filters', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  await page.locator('#filters').screenshot({ path: path.join(out, 'filters_stuck.png') });

  // cartes individuelles (mosaïque communauté)
  fs.mkdirSync(path.join(out, 'cards'), { recursive: true });
  const arts = page.locator('#wall article');
  for (let i = 0; i < await arts.count(); i++) {
    const a = arts.nth(i); const id = (await a.locator('a.card').getAttribute('href')).slice(1);
    await a.scrollIntoViewIfNeeded(); await page.waitForTimeout(80);
    await a.screenshot({ path: path.join(out, 'cards', id + '.png') });
  }

  // ---------- Partage ----------
  await page.locator('#partager').scrollIntoViewIfNeeded();
  await page.evaluate(() => { const r = document.querySelector('#partager').getBoundingClientRect(); window.scrollBy(0, r.top - 40); });
  await page.waitForTimeout(400); await shot('share');
  const chip = page.locator('#shareTex [data-st="Bouclés"]');
  const cb = await chip.boundingBox(); meta.shareTap = cb;
  await chip.click(); await page.waitForTimeout(250); await shot('share_sel');
  // aucun envoi de formulaire : on ne saisit rien, on n'envoie rien.

  // ---------- Quiz (interactions réelles) ----------
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
  await shot('quiz_home');
  const qbtn = page.locator('a[href="/#quiz"]').first();
  meta.quiz = { open: await qbtn.boundingBox(), taps: [] };
  await qbtn.click(); await page.waitForSelector('#qz .q-opt'); await page.waitForTimeout(500);
  const answers = [QUIZ.tex, QUIZ.concern, QUIZ.need];
  for (let i = 0; i < 3; i++) {
    await shot(`quiz_q${i + 1}`);
    const opt = page.locator(`#qz .q-opt[data-v="${answers[i]}"]`);
    await opt.scrollIntoViewIfNeeded();
    meta.quiz.taps.push(await opt.boundingBox());
    // on capture l'état « sélectionné » avant la transition automatique (180 ms côté site)
    await page.evaluate(v => { const b = document.querySelector(`#qz .q-opt[data-v="${v}"]`); b.setAttribute('aria-pressed', 'true'); }, answers[i]);
    await shot(`quiz_q${i + 1}_sel`);
    await opt.click(); await page.waitForTimeout(600);
  }
  await page.waitForSelector('#qz .twins'); await settle();
  await shot('quiz_result');
  meta.quiz.result = await page.$$eval('#qz .twin', els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim()));
  meta.quiz.answers = QUIZ;

  // ---------- Profil d'Andréa ----------
  await page.goto(SITE + '/cheveux-boucles-andrea', { waitUntil: 'load', timeout: 30000 });
  await settle(); await loadAll();
  await shot('andrea_top');
  await shot('andrea_full', { fullPage: true });
  meta.andrea = {
    height: await page.evaluate(() => document.documentElement.scrollHeight),
    steps: await page.$$eval('ol li, .step, [class*=step]', els => els.filter(e => /Étape/.test(e.innerText)).map(e => { const r = e.getBoundingClientRect(); return { y: r.y + scrollY, h: r.height, t: e.innerText.replace(/\s+/g, ' ').slice(0, 90) }; })),
  };
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify(meta, null, 2));
  await browser.close();
  console.log(variant, 'ok', Object.keys(meta));
}

const arg = process.argv[2] || 'all';
fs.mkdirSync(path.join(ROOT, 'src', 'data'), { recursive: true });
for (const v of arg === 'all' ? ['members', 'masked'] : [arg]) await run(v);
