// Rendu d'images de contrôle : node preview.mjs <composition> <frames séparées par virgule> <dossier>
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [id, frames, out] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
const comp = await selectComposition({ serveUrl, id, browserExecutable });
fs.mkdirSync(out, { recursive: true });
for (const fr of frames.split(',').map(Number)) {
  await renderStill({ serveUrl, composition: comp, frame: fr, output: path.join(out, `${id}_${String(fr).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85, browserExecutable, scale: 0.5 });
}
console.log('done');
