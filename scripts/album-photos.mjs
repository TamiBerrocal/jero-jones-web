// Builds the Senoidal photo book's images (senoidal.html, "Cerrando el circuito") from the originals in
// assets-src/album/NN.jpg into public/assets/album/NN.webp, baking in a printed, analog look: film tone,
// grain, dust and scratches, a vignette. Run `node scripts/album-photos.mjs` after changing a photo or a look.
// Everything is seeded per photo, so a rerun gives the same files.
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const root = join(import.meta.dirname, '..');
const srcDir = join(root, 'assets-src', 'album');
const outDir = join(root, 'public', 'assets', 'album');

// Book order. `edge` is the long edge in px: 1400 for photos that fill a page, less for the small slots.
// Looks: 'color-film' and 'bw-film' for the raw patio shots, 'duo-rosa' is a night/pink duotone, 'grain' only
// adds a fine grain to the venue photos that came already graded.
const PHOTOS = [
  { n: 1, look: 'color-film', edge: 1400, leak: 'left' },
  { n: 2, look: 'color-film', edge: 1100 },
  { n: 3, look: 'color-film', edge: 1100, leak: 'right' },
  { n: 4, look: 'duo-rosa', edge: 1200 },
  { n: 5, look: 'bw-film', edge: 900 },
  { n: 6, look: 'bw-film', edge: 900 },
  { n: 7, look: 'bw-film', edge: 900 },
  { n: 8, look: 'bw-film', edge: 900 },
  { n: 9, look: 'color-film', edge: 1000 },
  { n: 10, look: 'color-film', edge: 1000 },
  { n: 11, look: 'color-film', edge: 1000 },
  { n: 12, look: 'bw-film', edge: 1200 },
  { n: 13, look: 'grain', edge: 1400 },
  { n: 14, look: 'grain', edge: 900 },
  { n: 15, look: 'grain', edge: 900 },
  { n: 16, look: 'grain', edge: 900 },
  { n: 17, look: 'grain', edge: 900 },
  { n: 18, look: 'grain', edge: 900 },
  { n: 19, look: 'grain', edge: 1300 },
  { n: 20, look: 'grain', edge: 1400 },
];

const LOOKS = {
  'color-film': { grain: 15, chroma: 0.35, dust: 1, vignette: 0.32 },
  'bw-film': { grain: 19, chroma: 0, dust: 1.4, vignette: 0.38 },
  'duo-rosa': { grain: 14, chroma: 0, dust: 0.8, vignette: 0.25 },
  grain: { grain: 8, chroma: 0.2, dust: 0, vignette: 0.1 },
};

// Same PRNG as src/js/random.js.
function seededRandom(seedText) {
  let seed = 2166136261;
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 2246822507);
    seed = Math.imul(seed ^ (seed >>> 13), 3266489909);
    return ((seed ^= seed >>> 16) >>> 0) / 4294967296;
  };
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smooth = (x) => x * x * (3 - 2 * x);
// S-curve: blend between the straight line and a smoothstep.
const curve = (x, amount) => x + (smooth(x) - x) * amount;
const mix = (a, b, t) => a + (b - a) * t;

// Tone per look, on 0–1 RGB. Returns 0–255 RGB.
function tone(look, r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (look === 'bw-film') {
    // Crushed blacks, a little room left in the highlights (paper never gets to pure white).
    const v = curve(Math.min(1, Math.max(0, (lum - 0.04) / 0.94)), 0.75);
    const out = 10 + v * 236;
    return [out, out, out * 0.985];
  }
  if (look === 'duo-rosa') {
    // Gradient map in the site's palette: night → pink → warm cream.
    const v = curve(lum, 0.55);
    const stops = [[40, 29, 96], [216, 120, 140], [250, 236, 228]];
    const [a, c] = v < 0.5 ? [stops[0], stops[1]] : [stops[1], stops[2]];
    const t = v < 0.5 ? v / 0.5 : (v - 0.5) / 0.5;
    return [mix(a[0], c[0], t), mix(a[1], c[1], t), mix(a[2], c[2], t)];
  }
  if (look === 'color-film') {
    // Faded negative: less saturation, a soft S, lifted blacks, greenish shadows and warm highlights.
    const sat = 0.78;
    let rr = mix(lum, r, sat);
    let gg = mix(lum, g, sat);
    let bb = mix(lum, b, sat);
    rr = curve(rr, 0.35);
    gg = curve(gg, 0.35);
    bb = curve(bb, 0.3);
    const sh = (1 - lum) ** 2;
    const hi = lum ** 2;
    rr += -0.02 * sh + 0.05 * hi;
    gg += 0.025 * sh + 0.015 * hi;
    bb += 0.015 * sh - 0.06 * hi;
    const lift = 0.07;
    const top = 0.96;
    return [(lift + rr * (top - lift)) * 255, (lift * 1.05 + gg * (top - lift)) * 255, (lift * 1.1 + bb * (top - lift - 0.02)) * 255];
  }
  // 'grain': keep the grade as delivered.
  return [r * 255, g * 255, b * 255];
}

// Gaussian noise on a coarser grid, sampled bilinearly, so grain reads as clumps rather than pixel noise.
function noiseField(width, height, scale, random) {
  const gw = Math.ceil(width / scale) + 2;
  const gh = Math.ceil(height / scale) + 2;
  const grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i++) {
    const u = random() || 1e-9;
    grid[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  }
  return (x, y) => {
    const gx = x / scale;
    const gy = y / scale;
    const x0 = gx | 0;
    const y0 = gy | 0;
    const tx = gx - x0;
    const ty = gy - y0;
    const i = y0 * gw + x0;
    return mix(mix(grid[i], grid[i + 1], tx), mix(grid[i + gw], grid[i + gw + 1], tx), ty);
  };
}

// Dust and scratches as two masks: light (dirt on the negative prints white) and dark (dirt on the print).
async function dustMasks(width, height, amount, random) {
  const marks = (count, color) => {
    let svg = '';
    const scale = Math.max(width, height) / 1400;
    for (let i = 0; i < count; i++) {
      const x = random() * width;
      const y = random() * height;
      const kind = random();
      if (kind < 0.72) {
        // Specks.
        const r = (0.5 + random() ** 3 * 2.6) * scale;
        svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${(0.45 + random() * 0.55).toFixed(2)}"/>`;
      } else if (kind < 0.94) {
        // Fibres: short curly hairs.
        const len = (8 + random() * 30) * scale;
        const a = random() * Math.PI * 2;
        const x2 = x + Math.cos(a) * len;
        const y2 = y + Math.sin(a) * len;
        const cx = x + (random() - 0.5) * len * 1.4;
        const cy = y + (random() - 0.5) * len * 1.4;
        svg += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${color}" stroke-width="${(0.6 + random() * 0.8) * scale}" fill="none" opacity="${(0.4 + random() * 0.5).toFixed(2)}"/>`;
      } else {
        // Long, faint scratches running mostly along the film.
        const len = (height * (0.25 + random() * 0.6));
        const drift = (random() - 0.5) * 40 * scale;
        svg += `<path d="M${x.toFixed(1)} ${(y - len / 2).toFixed(1)} Q${(x + drift).toFixed(1)} ${y.toFixed(1)} ${(x + drift * 0.4).toFixed(1)} ${(y + len / 2).toFixed(1)}" stroke="${color}" stroke-width="${(0.5 + random() * 0.6) * scale}" fill="none" opacity="${(0.18 + random() * 0.25).toFixed(2)}"/>`;
      }
    }
    return svg;
  };
  const render = async (count) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/>${marks(count, 'white')}</svg>`;
    return sharp(Buffer.from(svg)).greyscale().blur(0.4).raw().toBuffer();
  };
  const area = (width * height) / 1e6;
  return {
    light: await render(Math.round(70 * amount * area)),
    dark: await render(Math.round(22 * amount * area)),
  };
}

async function build({ n, look, edge, leak }) {
  const name = String(n).padStart(2, '0');
  const random = seededRandom(`album-${name}-${look}`);
  const settings = LOOKS[look];
  const { data, info } = await sharp(join(srcDir, `${name}.jpg`))
    .rotate()
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const grain = noiseField(width, height, 1.5, random);
  const grainR = settings.chroma ? noiseField(width, height, 2.2, random) : null;
  const grainB = settings.chroma ? noiseField(width, height, 2.2, random) : null;
  const masks = settings.dust ? await dustMasks(width, height, settings.dust, random) : null;
  const leakX = leak === 'left' ? 0 : leak === 'right' ? width : null;
  const leakY = height * (0.2 + random() * 0.5);

  const out = Buffer.alloc(width * height * 3);
  const cx = width / 2;
  const cy = height / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      let [r, g, b] = tone(look, data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);

      // Light leak: a warm glow bleeding in from one edge.
      if (leakX !== null) {
        const d = Math.hypot((x - leakX) / width, (y - leakY) / height);
        const glow = Math.max(0, 1 - d / 0.55) ** 2 * 0.55;
        r += (255 - r) * glow;
        g += (150 - g) * glow * 0.75;
        b += (70 - b) * glow * 0.4;
      }

      // Vignette.
      const d = Math.hypot(x - cx, y - cy) / maxD;
      const v = 1 - settings.vignette * d ** 2.4;
      r *= v;
      g *= v;
      b *= v;

      // Grain, strongest in the midtones as on film.
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const amp = settings.grain * (0.45 + 2.2 * lum * (1 - lum));
      const mono = grain(x, y) * amp;
      r += mono + (grainR ? grainR(x, y) * amp * settings.chroma : 0);
      g += mono;
      b += mono + (grainB ? grainB(x, y) * amp * settings.chroma : 0);

      // Dust: light marks screen the print, dark marks multiply it.
      if (masks) {
        const p = y * width + x;
        const light = masks.light[p] / 255;
        const dark = masks.dark[p] / 255;
        if (light) {
          r += (250 - r) * light;
          g += (248 - g) * light;
          b += (240 - b) * light;
        }
        if (dark) {
          const k = 1 - dark * 0.85;
          r *= k;
          g *= k;
          b *= k;
        }
      }
      out[i] = clamp(r);
      out[i + 1] = clamp(g);
      out[i + 2] = clamp(b);
    }
  }

  const file = join(outDir, `${name}.webp`);
  await sharp(out, { raw: { width, height, channels: 3 } })
    .webp({ quality: 68, effort: 6, smartSubsample: true })
    .toFile(file);
  return { file, width, height, size: statSync(file).size };
}

mkdirSync(outDir, { recursive: true });
let total = 0;
for (const photo of PHOTOS) {
  const { width, height, size } = await build(photo);
  total += size;
  const name = String(photo.n).padStart(2, '0');
  console.log(`${name}.webp  ${photo.look.padEnd(10)}  ${width}x${height}  ${(size / 1024).toFixed(0)} KB`);
}
console.log(`total ${(total / 1024 / 1024).toFixed(2)} MB`);
