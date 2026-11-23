// Rendu final de tous les livrables.
// node render.mjs [filtre]   ex. : node render.mjs Main-916
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const filter = process.argv[2] || '';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = path.resolve('out');
const TMP = path.resolve('out/.silent');
fs.mkdirSync(TMP, { recursive: true });

const NAMES = {
  'Main-916': ['Tresser_Film_45s_9x16', 'music/out/tresser_45s.wav'],
  'Main-169': ['Tresser_Film_45s_16x9', 'music/out/tresser_45s.wav'],
  'Short-916': ['Tresser_Film_15s_9x16', 'music/out/tresser_15s.wav'],
};
const STILLS = { 'Cover-916': 'Tresser_Cover_9x16_TikTok-Reels', 'Cover-45': 'Tresser_Cover_4x5_Instagram', 'Thumb-169': 'Tresser_Miniature_16x9_YouTube' };
const LABEL = { members: 'MEMBRES_a-publier-apres-accord', masked: 'PUBLIABLE_photos-masquees' };

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public') });
for (const variant of ['masked', 'members']) {
  const dir = path.join(OUT, LABEL[variant]);
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, [name, music]] of Object.entries(NAMES)) {
    const id = `${key}-${variant}`;
    if (filter && !id.includes(filter)) continue;
    const composition = await selectComposition({ serveUrl, id, browserExecutable });
    const silent = path.join(TMP, `${id}.mp4`);
    const t = Date.now();
    await renderMedia({
      serveUrl, composition, codec: 'h264', outputLocation: silent, browserExecutable, muted: true,
      crf: 16, pixelFormat: 'yuv420p', x264Preset: 'slow', concurrency: 4, imageFormat: 'jpeg', jpegQuality: 95,
      onProgress: ({ progress }) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`\r${id} ${Math.round(progress * 100)}%  `); },
    });
    console.log(`\n${id} rendu en ${Math.round((Date.now() - t) / 1000)} s`);
    // passage en yuv420p plage TV / BT.709 (compatibilité Instagram, TikTok, YouTube)
    const video = path.join(TMP, `${id}_tv.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-vf', 'scale=in_range=full:out_range=limited,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-color_range', 'tv', '-colorspace', 'bt709',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', video]);
    const base = path.join(dir, `${name}_${variant === 'masked' ? 'publiable' : 'membres'}`);
    // version musique
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', music, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', `${base}.mp4`]);
    // version sans musique (piste audio muette, pour les réseaux qui ajoutent leur son)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', `${base}_sans-musique.mp4`]);
  }
  for (const [key, name] of Object.entries(STILLS)) {
    const id = `${key}-${variant}`;
    if (filter && !id.includes(filter)) continue;
    const composition = await selectComposition({ serveUrl, id, browserExecutable });
    const png = path.join(TMP, `${id}.png`);
    await renderStill({ serveUrl, composition, output: png, browserExecutable, imageFormat: 'png' });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-q:v', '2', path.join(dir, `${name}_${variant === 'masked' ? 'publiable' : 'membres'}.jpg`)]);
    console.log(id, 'ok');
  }
}
