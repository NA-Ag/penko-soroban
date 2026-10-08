// Draws the app icons from the sensei Penko sprite, so the logo always matches the mascot:
// Penko in front of a vermilion sun on washi paper.
//   public/favicon.svg, apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png
// Run with: npm run generate-icons

import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const pub = join(root, 'public');

// The sprite lives in TypeScript; bundle the bits we need into a temporary module
const bundled = join(root, 'node_modules', '.cache', 'sensei-sprite.mjs');
await build({
  stdin: {
    contents: `export { PENKO_ANIMATIONS } from './penko_anim'; export { PENKO_COLORS } from './components/penkoColors'; export { dressAsSensei } from './components/senseiCostume';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true, format: 'esm', platform: 'node', outfile: bundled, logLevel: 'silent',
});
const { PENKO_ANIMATIONS, PENKO_COLORS, dressAsSensei } = await import(pathToFileURL(bundled).href);
const matrix = dressAsSensei(PENKO_ANIMATIONS.idle[0]);

const PAPER = '#f4efe4';
const SHU = '#b8321d';

// `scale` is the sprite's share of the icon: smaller for maskable icons, whose edges get cropped
const iconSvg = ({ scale, rounded }) => {
  const size = 256;
  const sprite = size * scale;
  const offset = (size - sprite) / 2;
  const px = sprite / 16;
  const rects = [];
  matrix.forEach((row, y) => row.forEach((c, x) => {
    if (c) rects.push(`<rect x="${(offset + x * px).toFixed(2)}" y="${(offset + y * px).toFixed(2)}" width="${(px + 0.3).toFixed(2)}" height="${(px + 0.3).toFixed(2)}" fill="${PENKO_COLORS[c]}"/>`);
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">
<rect width="${size}" height="${size}" rx="${rounded ? 56 : 0}" fill="${PAPER}"/>
<circle cx="${size / 2}" cy="${size / 2 - sprite * 0.06}" r="${sprite * 0.36}" fill="${SHU}" opacity="0.9"/>
${rects.join('')}
</svg>`;
};

writeFileSync(join(pub, 'favicon.svg'), iconSvg({ scale: 0.86, rounded: true }));
const regular = Buffer.from(iconSvg({ scale: 0.78, rounded: false }));
const maskable = Buffer.from(iconSvg({ scale: 0.56, rounded: false }));
await sharp(regular, { density: 400 }).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
await sharp(regular, { density: 400 }).resize(192, 192).png().toFile(join(pub, 'pwa-192x192.png'));
await sharp(regular, { density: 400 }).resize(512, 512).png().toFile(join(pub, 'pwa-512x512.png'));
await sharp(maskable, { density: 400 }).resize(512, 512).png().toFile(join(pub, 'pwa-maskable-512x512.png'));
console.log('[icons] Wrote favicon.svg, apple-touch-icon.png and PWA icons to public/');
