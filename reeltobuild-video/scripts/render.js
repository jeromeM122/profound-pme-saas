// Rendu des vidéos finales et des covers.
// Usage : node scripts/render.js [stills|frames <comp> <s1,s2,..>|all]
const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { renderMedia, renderStill, selectComposition } = require('@remotion/renderer');

const browserExecutable = process.env.REMOTION_CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = path.join(__dirname, '..', 'out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const [mode = 'all', ...args] = process.argv.slice(2);
  const serveUrl = await bundle({ entryPoint: path.join(__dirname, '..', 'src', 'index.ts') });
  const opts = { serveUrl, browserExecutable, chromiumOptions: { gl: 'swangle' } };
  const comp = (id) => selectComposition({ ...opts, id, inputProps: {} });

  if (mode === 'frames') {
    const [id, secs] = args;
    const c = await comp(id);
    const dir = path.join(OUT, 'frames'); fs.mkdirSync(dir, { recursive: true });
    for (const s of secs.split(',').map(Number)) {
      const frame = Math.min(c.durationInFrames - 1, Math.round(s * c.fps));
      await renderStill({ ...opts, composition: c, frame, output: path.join(dir, `${id}_${s.toFixed(2)}.png`), scale: 0.5 });
      console.log('frame', id, s);
    }
    return;
  }
  if (mode === 'stills' || mode === 'all') {
    for (const id of ['Cover-9x16', 'Cover-16x9']) {
      const c = await comp(id);
      await renderStill({ ...opts, composition: c, output: path.join(OUT, `ReelToBuild_${id}.png`) });
      console.log('still', id);
    }
  }
  if (mode === 'all' || mode === 'videos') {
    const list = args.length ? args : ['Main-9x16', 'Main-16x9', 'Short-9x16'];
    for (const id of list) {
      const c = await comp(id);
      const output = path.join(OUT, `ReelToBuild_${id}.mp4`);
      let last = 0;
      await renderMedia({
        ...opts, composition: c, codec: 'h264', crf: 16, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '192k',
        x264Preset: 'slow', concurrency: 4, output,
        onProgress: ({ progress }) => { if (progress - last > 0.1) { last = progress; console.log(id, Math.round(progress * 100) + '%'); } },
      });
      console.log('video', output);
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });
