#!/usr/bin/env node
/**
 * Derives the website's artwork from the IqraQuest application's own
 * source art.
 *
 * The site must show the real product, so every image here is the
 * game's own asset — re-encoded for the web, never redrawn. The script
 * is idempotent and the outputs are committed, so a normal build (and
 * CI) never needs the application repository. Re-run it only when
 * the app's artwork changes:
 *
 *   IQRAQUEST_APP_DIR=/path/to/IqraQuest npm run assets
 *
 * Every output keeps a name that says what it is and where it came
 * from, which is part of the provenance story in
 * `/intellectual-property`.
 */
import { mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const APP_DIR =
  process.env.IQRAQUEST_APP_DIR ?? path.resolve('../upasco/iqraquest');
const OUT = path.resolve('public/assets');

/**
 * Encoding settings.
 *
 * AVIF quality 48 is the default; the hero drops to 44. Both were
 * chosen by inspecting a 1:1 crop of the horses' heads — the most
 * detail-sensitive area in the whole set — against quality 58. The
 * difference is invisible there and the hero loses 40% of its bytes,
 * which is the single largest thing on the page and the LCP element.
 */
const WEBP = { quality: 82, effort: 6 };
const AVIF_DEFAULT = 48;

const src = (p) => path.join(APP_DIR, p);

async function exists(p) {
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Writes a source image at a given width in WebP (and AVIF for the
 * large pieces, where the saving pays for the extra bytes in the repo).
 */
async function emit(
  source,
  name,
  { width, avif = false, fit = 'inside', avifQuality = AVIF_DEFAULT },
) {
  const input = sharp(source).rotate();
  const resized = width
    ? input.resize({ width, fit, withoutEnlargement: true })
    : input;

  const webpPath = path.join(OUT, `${name}.webp`);
  await resized.clone().webp(WEBP).toFile(webpPath);
  const written = [webpPath];

  if (avif) {
    const avifPath = path.join(OUT, `${name}.avif`);
    await resized
      .clone()
      .avif({ quality: avifQuality, effort: 6 })
      .toFile(avifPath);
    written.push(avifPath);
  }
  return written;
}

/** Extracts a square crop, used to pull the horses out of the icon. */
async function emitCrop(source, name, region, width) {
  const out = path.join(OUT, `${name}.webp`);
  await sharp(source)
    .extract(region)
    .resize({ width, withoutEnlargement: true })
    .webp(WEBP)
    .toFile(out);
  return [out];
}

async function main() {
  if (!(await exists(APP_DIR))) {
    console.error(
      `IqraQuest application not found at ${APP_DIR}.\n` +
        'Set IQRAQUEST_APP_DIR to a checkout of the app repository.\n' +
        'The committed assets in public/assets are already up to date — ' +
        'this script is only needed when the app artwork changes.',
    );
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  const produced = [];

  const jobs = [
    // ---- Hero and key art -------------------------------------------------
    // The app's own home key art: three galloping horses over the
    // painted plate. Portrait 1242x2688, used as the mobile hero.
    {
      from: 'assets/images/home_hero.webp',
      name: 'hero-key-art',
      width: 1242,
      avif: true,
      avifQuality: 44,
    },
    {
      from: 'assets/images/home_hero.webp',
      name: 'hero-key-art-sm',
      width: 720,
      avif: true,
      avifQuality: 44,
    },

    // The app icon artwork — the brand mark and the desktop hero's
    // focal image.
    {
      from: 'tool/art/source/app_icon_source.webp',
      name: 'brand-key-art',
      width: 1024,
      avif: true,
    },
    {
      from: 'tool/art/source/app_icon_source.webp',
      name: 'brand-key-art-sm',
      width: 512,
      avif: true,
    },

    // ---- The board --------------------------------------------------------
    {
      from: 'assets/board/cross_board.webp',
      name: 'board-cross',
      width: 1600,
      avif: true,
    },
    {
      from: 'assets/board/cross_board.webp',
      name: 'board-cross-sm',
      width: 800,
      avif: true,
    },

    // ---- World / environment ---------------------------------------------
    {
      from: 'assets/images/oasis_arrival.webp',
      name: 'world-oasis-arrival',
      width: 1244,
      avif: true,
    },
    {
      from: 'assets/images/world_band.webp',
      name: 'world-course',
      width: 1296,
      avif: true,
    },
    {
      from: 'assets/images/oasis_falls.webp',
      name: 'world-falls',
      width: 900,
    },
    {
      from: 'assets/images/region_dawn.webp',
      name: 'world-region-dawn',
      width: 900,
    },
    {
      from: 'assets/images/region_mountains.webp',
      name: 'world-region-mountains',
      width: 900,
    },
    {
      from: 'assets/images/region_oasis.webp',
      name: 'world-region-oasis',
      width: 900,
    },
    {
      from: 'assets/board/pack/backdrop_band.webp',
      name: 'world-backdrop-band',
      width: 936,
    },

    // ---- The four stables -------------------------------------------------
    ...['emerald', 'saphir', 'grenat', 'safran'].flatMap((team) => [
      {
        from: `assets/board/pack/horse_${team}.webp`,
        name: `horse-${team}`,
        width: 332,
      },
      {
        from: `assets/board/pack/camp_${team}.webp`,
        name: `camp-${team}`,
        width: 320,
      },
      {
        from: `assets/board/pack/banner_${team}.webp`,
        name: `banner-${team}`,
        width: 200,
      },
    ]),

    // ---- Board furniture used as section ornaments ------------------------
    { from: 'assets/board/pack/tile_bonus.webp', name: 'tile-bonus', width: 220 },
    {
      from: 'assets/board/pack/tile_question.webp',
      name: 'tile-question',
      width: 220,
    },
    {
      from: 'assets/board/pack/tile_treasure.webp',
      name: 'tile-treasure',
      width: 220,
    },
    {
      from: 'assets/board/pack/tile_checkpoint.webp',
      name: 'tile-checkpoint',
      width: 220,
    },
    { from: 'assets/board/pack/tile_start.webp', name: 'tile-start', width: 220 },
    {
      from: 'assets/board/pack/chest_open.webp',
      name: 'prop-chest-open',
      width: 260,
    },
    { from: 'assets/board/pack/campfire.webp', name: 'prop-campfire', width: 200 },
    {
      from: 'assets/board/pack/lantern_stand.webp',
      name: 'prop-lantern',
      width: 200,
    },
    { from: 'assets/board/pack/palm_tall_1.webp', name: 'prop-palm', width: 260 },
    {
      from: 'assets/board/pack/fx_reward_burst.webp',
      name: 'fx-reward-burst',
      width: 300,
    },
  ];

  for (const job of jobs) {
    const source = src(job.from);
    if (!(await exists(source))) {
      console.warn(`  skip (missing): ${job.from}`);
      continue;
    }
    const written = await emit(source, job.name, job);
    produced.push(...written);
    console.log(`  ${job.name} <- ${job.from}`);
  }

  // The brand mark: the three horses cropped out of the icon artwork,
  // with the painted gold frame removed, on a transparent-free square
  // that works as a favicon and as the header logo.
  const iconSource = src('tool/art/source/app_icon_source.webp');
  if (await exists(iconSource)) {
    const meta = await sharp(iconSource).metadata();
    // The source carries a painted frame ~4.5% in on every side.
    const inset = Math.round(Math.min(meta.width, meta.height) * 0.055);
    const region = {
      left: inset,
      top: inset,
      width: meta.width - inset * 2,
      height: meta.height - inset * 2,
    };
    for (const size of [512, 192, 180, 32]) {
      produced.push(
        ...(await emitCrop(iconSource, `brand-mark-${size}`, region, size)),
      );
    }
    // PNG copies for the platforms that still refuse WebP icons.
    for (const size of [512, 192, 180]) {
      const out = path.join(OUT, `brand-mark-${size}.png`);
      await sharp(iconSource)
        .extract(region)
        .resize({ width: size })
        .png({ compressionLevel: 9 })
        .toFile(out);
      produced.push(out);
    }
    // Favicon: a 48px ICO-compatible PNG. Browsers accept PNG at
    // /favicon.ico and it avoids shipping a second format.
    const favicon = path.resolve('app/icon.png');
    await sharp(iconSource)
      .extract(region)
      .resize({ width: 96 })
      .png({ compressionLevel: 9 })
      .toFile(favicon);
    produced.push(favicon);
    // Apple touch icon, opaque as the platform requires.
    const apple = path.resolve('app/apple-icon.png');
    await sharp(iconSource)
      .extract(region)
      .resize({ width: 180 })
      .flatten({ background: '#082E22' })
      .png({ compressionLevel: 9 })
      .toFile(apple);
    produced.push(apple);
    console.log('  brand-mark-* + app icons <- app_icon_source.webp');
  }

  // The Open Graph card is composed rather than cropped: 1200x630 with
  // the key art bled to the right and a dark emerald field on the left
  // for the wordmark, which is drawn as SVG so the type stays crisp.
  if (await exists(iconSource)) {
    await composeOpenGraph(iconSource);
    console.log('  og-card.jpg (1200x630) composed');
  }

  console.log(`\n${produced.length} files written to ${OUT}`);
}

/**
 * Builds the social share card. Every surface that unfurls a link —
 * WhatsApp, iMessage, Facebook, LinkedIn, X, Discord — reads this one
 * image, so it carries the mark, the name, the baseline and the
 * domain, and nothing else.
 */
async function composeOpenGraph(iconSource) {
  const W = 1200;
  const H = 630;

  const art = await sharp(iconSource)
    .resize({ width: 700, height: H, fit: 'cover', position: 'right top' })
    .toBuffer();

  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.30" stop-color="#08281F" stop-opacity="1"/>
          <stop offset="0.62" stop-color="#08281F" stop-opacity="0.86"/>
          <stop offset="1" stop-color="#08281F" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#C89B45"/>
          <stop offset="1" stop-color="#C89B45" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#fade)"/>
      <rect x="0" y="0" width="${W}" height="8" fill="#C89B45"/>
      <text x="86" y="258" font-family="Georgia, 'Times New Roman', serif"
            font-size="86" font-weight="700" letter-spacing="2"
            fill="#FFF9ED">IqraQuest</text>
      <rect x="88" y="292" width="220" height="3" fill="url(#rule)"/>
      <text x="86" y="360" font-family="Georgia, 'Times New Roman', serif"
            font-size="35" fill="#D9BD82">La course au savoir commence ici.</text>
      <text x="86" y="424" font-family="Helvetica, Arial, sans-serif"
            font-size="24" fill="#F7F0DF" opacity="0.82">Jeu de plateau familial · Culture islamique</text>
      <text x="86" y="548" font-family="Helvetica, Arial, sans-serif"
            font-size="24" letter-spacing="3" fill="#C89B45">IQRAQUEST.ORG</text>
    </svg>`,
  );

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: '#08281F',
    },
  })
    .composite([
      { input: art, left: W - 700, top: 0 },
      { input: overlay, left: 0, top: 0 },
    ])
    // JPEG, not PNG: the card is mostly photographic artwork, and the
    // PNG of the same image is nine times the size for no visible gain.
    // Every scraper that unfurls a link handles JPEG, and a smaller file
    // means the preview appears rather than timing out.
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(path.resolve('public/assets/og-card.jpg'));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
