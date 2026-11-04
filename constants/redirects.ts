import type { NextConfig } from 'next';

export type NextRedirect = NonNullable<
  Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>
>[number];

/**
 * 301 Permanent Redirects for legacy and restructured URLs.
 * Uses HTTP 301 (Moved Permanently) for SEO equity and index preservation.
 */
export const URL_301_REDIRECTS: NextRedirect[] = [
  // --- Static Pages ---
  {
    source: '/about-us',
    destination: '/about-us-kubera-now',
    statusCode: 301,
  },
  {
    source: '/advertise',
    destination: '/advertise-with-us',
    statusCode: 301,
  },
  {
    source: '/career',
    destination: '/careers',
    statusCode: 301,
  },
  {
    source: '/contact',
    destination: '/contact-us',
    statusCode: 301,
  },

  // --- Category: Companies -> Business ---
  {
    source: '/companies',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026081400010',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026081400022',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026081700025',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026082400010',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026082500005',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/2026082500021',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/lt-bess-projects-west-asia-large-order',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/lt-ultra-mega-middle-east-gas-compression-order',
    destination: '/business',
    statusCode: 301,
  },
  {
    source:
      '/companies/reliance-rolls-royce-indigenous-amca-fighter-engine-partnership',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/companies/amazon-flipkart-seller-fees-hiked-festive-season',
    destination:
      '/business/amazon-flipkart-seller-fees-hiked-festive-season-2026082500005',
    statusCode: 301,
  },
  {
    source:
      '/companies/bsnl-freedom-2-offer-rs-1-sim-4g-expansion-fibre-plan-2026',
    destination:
      '/business/bsnl-freedom-2-offer-rs-1-sim-4g-expansion-fibre-plan-2026-2026081400022',
    statusCode: 301,
  },
  {
    source:
      '/companies/larsen-toubro-order-book-crosses-rs-1-4-lakh-crore-in-five-months',
    destination: '/market',
    statusCode: 301,
  },

  // --- Market Stories -> Business / IPO / Market ---
  {
    source: '/market/2026082400005',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/market/2026082500023',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/market/purple-style-labs-ipo-price-band-lot-size',
    destination: '/business',
    statusCode: 301,
  },
  {
    source:
      '/market/stocks-in-news-26-august-2026-which-top-shares-can-be-in-focus-today',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/market/testing-2026082700012',
    destination: '/business',
    statusCode: 301,
  },
  {
    source: '/market/esds-ipo-grey-market-demand-august',
    destination:
      '/ipo/esds-software-ipo-day-2-subscription-gmp-august-2026083100007',
    statusCode: 301,
  },
  {
    source:
      '/market/lumino-industries-ipo-opens-on-august-27-to-raise-rs-500-crore',
    destination:
      '/ipo/lumino-industries-ipo-opens-on-august-27-to-raise-rs-500-crore-2026082200003',
    statusCode: 301,
  },
  {
    source: '/market/rays-of-belief-ipo-price-band-September',
    destination: '/ipo/rays-of-belief-ipo-price-band-September-2026082400005',
    statusCode: 301,
  },
  {
    source: '/market/sembcorp-green-infra-ipo-crore-debt-repayment',
    destination:
      '/ipo/sembcorp-green-infra-ipo-crore-debt-repayment-2026082700006',
    statusCode: 301,
  },
  {
    source:
      '/market/sebi-eases-online-bond-platform-rules-allows-ifsca-and-54ec-tax-saving-bonds',
    destination: '/market',
    statusCode: 301,
  },

  // --- Gujarat Metro Article (Raw & Percent-Encoded Sources) ---
  {
    source:
      '/gujarat/અમદાવાદ-મેટ્રોની-દૈનિક-મુસાફરી-2-લાખને-પાર-મેગા-ઇવેન્ટ-વગર-નોંધાયો-નવો-માઇલસ્ટોન',
    destination:
      "/gujarat/Ahmedabad%20Metro's%20daily%20ridership%20crosses%202%20lakh,%20new%20milestone%20recorded%20without%20mega%20event-2026081400018",
    statusCode: 301,
  },
  {
    source:
      '/gujarat/%E0%AA%85%E0%AA%AE%E0%AA%A6%E0%AA%BE%E0%AA%B5%E0%AA%BE%E0%AA%A6-%E0%AA%AE%E0%AB%87%E0%AA%9F%E0%AB%8D%E0%AA%B0%E0%AB%8B%E0%AA%A8%E0%AB%80-%E0%AA%A6%E0%AB%88%E0%AA%A8%E0%AA%BF%E0%AA%95-%E0%AA%AE%E0%AB%81%E0%AA%B8%E0%AA%BE%E0%AA%AB%E0%AA%B0%E0%AB%80-2-%E0%AA%B2%E0%AA%BE%E0%AA%96%E0%AA%A8%E0%AB%87-%E0%AA%AA%E0%AA%BE%E0%AA%B0-%E0%AA%AE%E0%AB%87%E0%AA%97%E0%AA%BE-%E0%AA%87%E0%AA%B5%E0%AB%87%E0%AA%A8%E0%AB%8D%E0%AA%9F-%E0%AA%B5%E0%AA%97%E0%AA%B0-%E0%AA%A8%E0%AB%8B%E0%AA%82%E0%AA%A7%E0%AA%BE%E0%AA%AF%E0%AB%8B-%E0%AA%A8%E0%AB%8B-%E0%AA%AE%E0%AA%BE%E0%AA%87%E0%AA%B2%E0%AA%B8%E0%AB%8D%E0%AA%9F%E0%AB%8B%E0%AA%A8',
    destination:
      "/gujarat/Ahmedabad%20Metro's%20daily%20ridership%20crosses%202%20lakh,%20new%20milestone%20recorded%20without%20mega%20event-2026081400018",
    statusCode: 301,
  },

  // --- Economy RBI FCNR Window Article ---
  {
    source:
      '/economy/RBI%20closes%20FCNR%28B%29%20window%20early%20after%20$52.3%20billion%20dollar%20inflow,%20cost%20not%20target%20is%20main%20reason%3A%20SBI%20Research-2026081700051',
    destination:
      '/market/rbl-bank-shares-rise-after-three%20to-%20four-billion-dollar-fcnr-deposit-collection-2026090300021',
    statusCode: 301,
  },

  // --- Personal Finance REIT Articles ---
  {
    source:
      '/personal-finance/reit-રિયલ-એસ્ટેટમાં-ઓછી-મૂડીથી-રોકાણ-કરો-અને-કમાઓ-નિ௯મિત-ડિવિડન્ડ',
    destination:
      '/personal-finance/REIT%3A%20Invest%20in%20real%20estate%20with%20little%20capital%20and%20earn%20regular%20dividends-2026081400016',
    statusCode: 301,
  },
  {
    source:
      '/personal-finance/reit-%E0%AA%B0%E0%AA%BF%E0%AA%AF%E0%AA%B2-%E0%AA%8F%E0%AA%B8%E0%AB%8D%E0%AA%9F%E0%AB%87%E0%AA%9F%E0%AA%AE%E0%AA%BE%E0%AA%82-%E0%AA%93%E0%AA%9B%E0%AB%80-%E0%AA%AE%E0%AB%82%E0%AA%A1%E0%AB%80%E0%AA%A5%E0%AB%80-%E0%AA%B0%E0%AB%8B%E0%AA%95%E0%AA%BE%E0%AA%A3-%E0%AA%95%E0%AA%B0%E0%AB%8B-%E0%AA%85%E0%AA%A8%E0%AB%87-%E0%AA%95%E0%AA%AE%E0%AA%BE%E0%AA%93-%E0%AA%A8%E0%AA%BF%E0%AF%8F%E0%AA%AE%E0%AA%BF%E0%AA%A4-%E0%AA%A1%E0%AA%BF%E0%AA%B5%E0%AA%BF%E0%AA%A1%E0%AA%A8%E0%AB%8D%E0%AA%A1',
    destination:
      '/personal-finance/REIT%3A%20Invest%20in%20real%20estate%20with%20little%20capital%20and%20earn%20regular%20dividends-2026081400016',
    statusCode: 301,
  },
  {
    source:
      '/personal-finance/reit-રિયલ-એસ્ટેટમાં-ઓછી-મૂડીથી-રોકાણ-કરો-અને-કમાવો-નિયમિત-ડિવિડન્ડ',
    destination:
      '/personal-finance/REIT%3A%20Invest%20in%20real%20estate%20with%20little%20capital%20and%20earn%20regular%20dividends-2026081400016',
    statusCode: 301,
  },
  {
    source:
      '/personal-finance/reit-%E0%AA%B0%E0%AA%BF%E0%AA%AF%E0%AA%B2-%E0%AA%8F%E0%AA%B8%E0%AB%8D%E0%AA%9F%E0%AB%87%E0%AA%9F%E0%AA%AE%E0%AA%BE%E0%AA%82-%E0%AA%93%E0%AA%9B%E0%AB%80-%E0%AA%AE%E0%AB%82%E0%AA%A1%E0%AB%80%E0%AA%A5%E0%AB%80-%E0%AA%B0%E0%AB%8B%E0%AA%95%E0%AA%BE%E0%AA%A3-%E0%AA%95%E0%AA%B0%E0%AB%8B-%E0%AA%85%E0%AA%A8%E0%AB%87-%E0%AA%95%E0%AA%AE%E0%AA%BE%E0%AA%B5%E0%AB%8B-%E0%AA%A8%E0%AA%BF%E0%AA%AF%E0%AA%AE%E0%AA%BF%E0%AA%A4-%E0%AA%A1%E0%AA%BF%E0%AA%B5%E0%AA%BF%E0%AA%A1%E0%AA%A8%E0%AB%8D%E0%AA%A1',
    destination:
      '/personal-finance/REIT%3A%20Invest%20in%20real%20estate%20with%20little%20capital%20and%20earn%20regular%20dividends-2026081400016',
    statusCode: 301,
  },
];

/**
 * Fast lookup map for proxy/middleware runtime matching.
 * Handles exact, raw decoded, and percent-encoded paths seamlessly.
 */
const REDIRECT_MAP = new Map<string, string>();

function registerRedirect(source: string, destination: string) {
  // Register exact source
  REDIRECT_MAP.set(source, destination);

  // Register decoded variant
  try {
    const decoded = decodeURIComponent(source);
    if (decoded !== source) {
      REDIRECT_MAP.set(decoded, destination);
    }
  } catch {}

  // Register encoded variant
  try {
    const encoded = encodeURI(source);
    if (encoded !== source) {
      REDIRECT_MAP.set(encoded, destination);
    }
  } catch {}
}

// Populate from standard list
for (const rule of URL_301_REDIRECTS) {
  registerRedirect(rule.source, rule.destination);
}

// Explicit mappings for raw unencoded space/colon forms
registerRedirect(
  '/economy/RBI closes FCNR(B) window early after $52.3 billion dollar inflow, cost not target is main reason: SBI Research-2026081700051',
  '/market/rbl-bank-shares-rise-after-three%20to-%20four-billion-dollar-fcnr-deposit-collection-2026090300021'
);

registerRedirect(
  '/personal-finance/REIT: Invest in real estate with little capital and earn regular dividends-2026081400016',
  '/personal-finance/REIT%3A%20Invest%20in%20real%20estate%20with%20little%20capital%20and%20earn%20regular%20dividends-2026081400016'
);

/**
 * Resolves a destination for a given pathname if a 301 redirect is registered.
 */
export function get301RedirectDestination(pathname: string): string | null {
  if (!pathname) return null;

  // Direct check
  const directMatch = REDIRECT_MAP.get(pathname);
  if (directMatch && directMatch !== pathname) {
    return directMatch;
  }

  // Trailing slash normalized check
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : `${pathname}/`;
  const trailingMatch = REDIRECT_MAP.get(normalized);
  if (trailingMatch && trailingMatch !== pathname) {
    return trailingMatch;
  }

  // Decoded check
  try {
    const decoded = decodeURIComponent(pathname);
    const decodedMatch = REDIRECT_MAP.get(decoded);
    if (decodedMatch && decodedMatch !== pathname && decodedMatch !== decoded) {
      return decodedMatch;
    }
  } catch {}

  return null;
}
