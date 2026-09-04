/**
 * IqraQuest — central site configuration.
 *
 * Single source of truth for everything the site says about itself:
 * identity, canonical URL, store availability, contact and social
 * presence. Nothing in `app/` or `components/` may hardcode a domain,
 * an e-mail address or a store link — read it from here.
 *
 * Values that change per environment (store URLs, analytics) are read
 * from environment variables so the site can be updated without a code
 * change. See `.env.example` and DEPLOYMENT.md.
 */

/** Reads a public env var, treating empty strings as unset. */
function env(name: string): string | undefined {
  const raw = process.env[name];
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value.length > 0 ? value : undefined;
}

/** Reads a boolean flag. Only the exact string "true" enables it. */
function flag(name: string): boolean {
  return env(name)?.toLowerCase() === 'true';
}

const DOMAIN = 'iqraquest.org';
const CANONICAL_URL = `https://${DOMAIN}`;

/**
 * App Store / Google Play.
 *
 * Both stores stay in "coming soon" mode until BOTH the availability
 * flag is true AND a real URL is configured. This makes it impossible
 * to ship a badge that links nowhere: setting only the flag, or only
 * the URL, keeps the badge disabled.
 */
const appleAppUrl = env('NEXT_PUBLIC_APPLE_APP_URL');
const googlePlayUrl = env('NEXT_PUBLIC_GOOGLE_PLAY_URL');

export const stores = {
  ios: {
    url: appleAppUrl,
    available: flag('NEXT_PUBLIC_APP_AVAILABLE_IOS') && Boolean(appleAppUrl),
  },
  android: {
    url: googlePlayUrl,
    available:
      flag('NEXT_PUBLIC_APP_AVAILABLE_ANDROID') && Boolean(googlePlayUrl),
  },
} as const;

/** True once at least one store listing is live. */
export const isAnyStoreLive = stores.ios.available || stores.android.available;

/**
 * Social profiles.
 *
 * Only platforms with a real, configured URL are rendered — the site
 * never links to a profile that does not exist. Add the environment
 * variable to make the icon appear.
 */
export const socialLinks = [
  { id: 'tiktok', label: 'TikTok', url: env('NEXT_PUBLIC_SOCIAL_TIKTOK') },
  {
    id: 'instagram',
    label: 'Instagram',
    url: env('NEXT_PUBLIC_SOCIAL_INSTAGRAM'),
  },
  { id: 'youtube', label: 'YouTube', url: env('NEXT_PUBLIC_SOCIAL_YOUTUBE') },
  {
    id: 'facebook',
    label: 'Facebook',
    url: env('NEXT_PUBLIC_SOCIAL_FACEBOOK'),
  },
  { id: 'x', label: 'X', url: env('NEXT_PUBLIC_SOCIAL_X') },
].filter((link): link is { id: string; label: string; url: string } =>
  Boolean(link.url),
);

export const siteConfig = {
  /** Product and brand name, exactly as it must always be written. */
  siteName: 'IqraQuest',
  brandName: 'IqraQuest',

  /**
   * Trademark marker. "™" asserts use as a trademark and requires no
   * registration. "®" is reserved for a registered mark and is
   * deliberately never used until registration is confirmed — using it
   * without registration is an offence in several jurisdictions.
   */
  trademarkMark: '™',

  /** Legal publisher of the site and rights holder of record. */
  publisher: 'IqraQuest',

  domain: DOMAIN,
  canonicalUrl: CANONICAL_URL,

  /**
   * Official support address. Centralised so it can be changed in one
   * place; the mailbox itself is hosted independently of this website
   * (see DEPLOYMENT.md — the site never touches the domain's MX records).
   */
  supportEmail: env('NEXT_PUBLIC_SUPPORT_EMAIL') ?? 'support@iqraquest.org',

  /**
   * Copyright year shown in the footer and in metadata. The site does
   * not compute this from the clock: a build in December must not
   * silently change the notice, and a rendered year that differs
   * between server and client would hydrate inconsistently.
   */
  copyrightYear: 2026,

  /** First public availability of the brand, used in structured data. */
  foundingYear: 2026,

  stores,
  socialLinks,

  /** Store-listing facts, kept in sync with the application repository. */
  app: {
    /** Total questions shipped in the release bank. */
    questionCount: 900,
    /** Questions playable without the Premium unlock. */
    freeQuestionCount: 50,
    /** Languages the application ships. */
    languageCount: 12,
    /** Squares on the cross board. */
    boardSquares: 52,
    /** Horses per stable. */
    horsesPerStable: 4,
    /** Players supported on a single device. */
    maxPlayers: 4,
    /** Age range from the store listing. */
    ageRange: '7–99',
  },
} as const;

export type SiteConfig = typeof siteConfig;
