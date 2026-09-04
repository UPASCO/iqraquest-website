#!/usr/bin/env node
/**
 * Composes the "board in play" image the site shows.
 *
 * The painted plate on its own is a beautiful empty table: no pieces,
 * no bonus squares, nothing happening. It shows the craft but not the
 * game. This lays the game's own pieces onto it in a plausible
 * mid-race position, so a visitor sees what a turn actually looks like.
 *
 * Nothing here is invented artwork:
 *
 * - the plate is `assets/board/cross_board.webp`, untouched;
 * - the horses are `assets/board/horses/horse_<team>.webp`, the app's
 *   own tokens — the four knight pieces in the four stable colours;
 * - the bonus medallions are drawn to the specification in the app's
 *   DESIGN_SYSTEM.md (§Bonus medallions), which describes them exactly:
 *   "a round emerald coin for +5, a sapphire octagon with a double ring
 *   for +10, the eight-point khatim star in crimson for the rare +20 —
 *   all with the plate's gold rim, a small gold dome over the number,
 *   an embossed ivory numeral with a '+' and a cast shadow". They are
 *   drawn rather than lifted because the app draws them too, at
 *   runtime, with `BonusTileArt`; no raster of them exists.
 *
 * The geometry is measured from the plate, not guessed: the outermost
 * tiles of the horizontal arm sit at x=118 and x=1930 on the 2048px
 * source, which over fourteen steps gives the pitch below.
 */
import path from 'node:path';
import sharp from 'sharp';

/** Source plate is 2048x2048. */
const SIZE = 2048;
const PITCH_SRC = 1812 / 14;
const ORIGIN_SRC = 118 - PITCH_SRC / 2;

/**
 * Geometry for a given output width.
 *
 * sharp applies `composite` AFTER `resize`, so overlay coordinates are
 * in the *output* space, not the source's. Computing them against the
 * 2048px plate and then resizing shifts every piece by the scale
 * factor — which is exactly the bug this function exists to prevent.
 * The plate is resized first, and everything below is measured on the
 * result.
 */
function geometry(width) {
  const scale = width / SIZE;
  const pitch = PITCH_SRC * scale;
  const origin = ORIGIN_SRC * scale;
  return {
    pitch,
    centre: (col, row) => ({
      x: origin + (col + 0.5) * pitch,
      y: origin + (row + 0.5) * pitch,
    }),
  };
}

/**
 * The position on the board.
 *
 * Two horses per stable, spread across all four quadrants and
 * deliberately uneven — a real mid-race is not symmetric. Émeraude and
 * Grenat each have one piece already turned onto their own coloured
 * home run; Saphir still has one on its starting square.
 *
 * `ready` marks the piece whose turn it is, which wears the gold halo
 * the app gives a horse that can take the prize.
 */
const HORSES = [
  { team: 'emerald', col: 1, row: 8 },
  { team: 'emerald', col: 4, row: 7, ready: true },
  { team: 'saphir', col: 6, row: 10 },
  { team: 'saphir', col: 6, row: 14 },
  { team: 'grenat', col: 8, row: 1 },
  { team: 'grenat', col: 7, row: 4 },
  { team: 'safran', col: 13, row: 6 },
  { team: 'safran', col: 11, row: 8 },
];

/** Bonus squares, on track cells no horse occupies. */
const BONUSES = [
  { value: 5, col: 4, row: 6 },
  { value: 5, col: 9, row: 8 },
  { value: 5, col: 6, row: 3 },
  { value: 5, col: 8, row: 11 },
  { value: 10, col: 2, row: 8 },
  { value: 10, col: 12, row: 8 },
  { value: 10, col: 6, row: 1 },
  { value: 20, col: 10, row: 6 },
  { value: 20, col: 8, row: 13 },
];

/* ------------------------------------------------------------------ */
/* Bonus medallions                                                    */
/* ------------------------------------------------------------------ */

const MEDALLION = {
  5: { body: '#0E6B52', edge: '#08402F', shape: 'coin' },
  10: { body: '#1E5B8C', edge: '#123A5A', shape: 'octagon' },
  20: { body: '#8C2A3D', edge: '#5A1826', shape: 'star' },
};

/** Points of a regular octagon inscribed in a circle of radius r. */
function octagon(cx, cy, r) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i - Math.PI / 8;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/** The eight-point khātim star that rides the plate's own corners. */
function khatimStar(cx, cy, outer, inner) {
  return Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/**
 * One medallion as an SVG buffer.
 *
 * Told apart by shape AND number, never by colour alone — the app's
 * colourblind-safe rule, which applies just as much to a picture of the
 * board as to the board itself.
 */
function medallionSvg(value, size) {
  const { body, edge, shape } = MEDALLION[value];
  const c = size / 2;
  const r = size * 0.4;
  const id = `m${value}`;

  let face;
  if (shape === 'coin') {
    face = `<circle cx="${c}" cy="${c}" r="${r}" fill="url(#${id}f)" stroke="#C89B45" stroke-width="${size * 0.045}"/>`;
  } else if (shape === 'octagon') {
    face =
      `<polygon points="${octagon(c, c, r)}" fill="url(#${id}f)" stroke="#C89B45" stroke-width="${size * 0.045}"/>` +
      `<polygon points="${octagon(c, c, r * 0.82)}" fill="none" stroke="#C89B45" stroke-width="${size * 0.022}" opacity="0.75"/>`;
  } else {
    face =
      `<polygon points="${khatimStar(c, c, r * 1.08, r * 0.56)}" fill="url(#${id}f)" stroke="#C89B45" stroke-width="${size * 0.04}" stroke-linejoin="round"/>` +
      `<circle cx="${c}" cy="${c}" r="${r * 0.5}" fill="none" stroke="#E2BA63" stroke-width="${size * 0.02}" opacity="0.7"/>`;
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="${id}f" cx="38%" cy="30%" r="78%">
          <stop offset="0%" stop-color="${body}" stop-opacity="1"/>
          <stop offset="62%" stop-color="${body}"/>
          <stop offset="100%" stop-color="${edge}"/>
        </radialGradient>
        <linearGradient id="${id}d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F0D28C"/>
          <stop offset="100%" stop-color="#B8862F"/>
        </linearGradient>
        <filter id="${id}s" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="${size * 0.045}" stdDeviation="${size * 0.05}" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g filter="url(#${id}s)">
        ${face}
        <ellipse cx="${c}" cy="${c - r * 0.62}" rx="${r * 0.42}" ry="${r * 0.2}"
                 fill="url(#${id}d)" opacity="0.95"/>
        <text x="${c}" y="${c + size * 0.115}" text-anchor="middle"
              font-family="Georgia, 'Times New Roman', serif"
              font-size="${size * 0.34}" font-weight="700"
              fill="#FFF9ED" stroke="#3A2A12" stroke-width="${size * 0.012}"
              paint-order="stroke">+${value}</text>
      </g>
    </svg>`,
  );
}

/** The breathing halo the app puts under a horse that can ride. */
function readyHaloSvg(size) {
  const c = size / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E2BA63" stop-opacity="0.85"/>
          <stop offset="55%" stop-color="#C89B45" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#C89B45" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${c}" cy="${c}" rx="${c * 0.94}" ry="${c * 0.56}" fill="url(#halo)"/>
      <ellipse cx="${c}" cy="${c}" rx="${c * 0.6}" ry="${c * 0.34}"
               fill="none" stroke="#E2BA63" stroke-width="${size * 0.022}" opacity="0.8"/>
    </svg>`,
  );
}

/* ------------------------------------------------------------------ */

export async function composeBoardInPlay(appDir, outFile, width) {
  const plate = path.join(appDir, 'assets/board/cross_board.webp');
  const { pitch, centre } = geometry(width);

  // Resize first, then overlay: see `geometry`.
  const base = await sharp(plate).resize({ width }).png().toBuffer();
  const layers = [];

  // Bonus medallions go down first: a horse standing on the next square
  // should overlap the one behind it, not the other way round.
  const medallionSize = Math.round(pitch * 0.68);
  for (const bonus of BONUSES) {
    const { x, y } = centre(bonus.col, bonus.row);
    layers.push({
      input: await sharp(medallionSvg(bonus.value, medallionSize))
        .png()
        .toBuffer(),
      left: Math.round(x - medallionSize / 2),
      top: Math.round(y - medallionSize / 2),
    });
  }

  // The halo sits under its horse.
  const haloSize = Math.round(pitch * 1.15);
  for (const horse of HORSES.filter((h) => h.ready)) {
    const { x, y } = centre(horse.col, horse.row);
    layers.push({
      input: await sharp(readyHaloSvg(haloSize)).png().toBuffer(),
      left: Math.round(x - haloSize / 2),
      top: Math.round(y - haloSize * 0.34),
    });
  }

  // Horses, painted back to front so a nearer piece overlaps a farther
  // one where two sit on adjacent squares.
  const ordered = [...HORSES].sort((a, b) => a.row - b.row);
  const tokenWidth = Math.round(pitch * 0.9);
  for (const horse of ordered) {
    const file = path.join(
      appDir,
      `assets/board/horses/horse_${horse.team}.webp`,
    );
    const token = sharp(file).resize({ width: tokenWidth });
    const meta = await token.metadata();
    const buf = await token.png().toBuffer();
    const { x, y } = centre(horse.col, horse.row);
    layers.push({
      input: buf,
      left: Math.round(x - meta.width / 2),
      // The token's base disc sits at its foot; align that with the
      // square rather than centring the whole piece, so it stands on
      // the tile instead of floating above it.
      top: Math.round(y - meta.height + pitch * 0.34),
    });
  }

  await sharp(base)
    .composite(layers)
    .webp({ quality: 82, effort: 6 })
    .toFile(`${outFile}.webp`);

  await sharp(base)
    .composite(layers)
    .avif({ quality: 48, effort: 6 })
    .toFile(`${outFile}.avif`);
}

// Runnable on its own for iterating on the layout.
if (import.meta.url === `file://${process.argv[1]}`) {
  const appDir =
    process.env.IQRAQUEST_APP_DIR ?? path.resolve('../upasco/iqraquest');
  const out = process.argv[2] ?? path.resolve('public/assets/board-in-play');
  await composeBoardInPlay(appDir, out, 1600);
  console.log(`${out}.webp / .avif written`);
}
