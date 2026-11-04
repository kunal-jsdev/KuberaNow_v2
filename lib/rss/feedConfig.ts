export interface FeedDefinition {
  id: string;
  urlPath: string;
  categorySlug?: string;
  titleEn: string;
  titleGu: string;
  description: string;
  iconName: string;
  sectionGroup: 'all' | 'markets' | 'news' | 'special';
}

export const CATEGORY_ALIAS_MAP: Record<string, string> = {
  companies: 'business',
  global: 'world',
  commodities: 'commodity',

  business: 'business',
  world: 'world',
  commodity: 'commodity',
  market: 'market',
  ipo: 'ipo',
  economy: 'economy',
  'personal-finance': 'personal-finance',
  gujarat: 'gujarat',
  india: 'india',
};

export const RSS_FEEDS: FeedDefinition[] = [
  {
    id: 'all',
    urlPath: '/rss.xml',
    titleEn: 'All Articles',
    titleGu: 'તમામ સમાચાર',
    description:
      'Latest 50 published articles across all business, finance, and market sections.',
    iconName: 'newspaper',
    sectionGroup: 'all',
  },
  {
    id: 'market',
    urlPath: '/rss/market',
    categorySlug: 'market',
    titleEn: 'Market',
    titleGu: 'શેરબજાર',
    description:
      'Live updates, stock market trends, Nifty/Sensex indices, and technical analysis.',
    iconName: 'trending-up',
    sectionGroup: 'markets',
  },
  {
    id: 'ipo',
    urlPath: '/rss/ipo',
    categorySlug: 'ipo',
    titleEn: 'IPO',
    titleGu: 'આઈપીઓ',
    description:
      'Upcoming IPOs, subscription status, GMP updates, and listing performance.',
    iconName: 'sparkles',
    sectionGroup: 'markets',
  },
  {
    id: 'economy',
    urlPath: '/rss/economy',
    categorySlug: 'economy',
    titleEn: 'Economy',
    titleGu: 'અર્થતંત્ર',
    description:
      'Macroeconomics, RBI policy, GDP numbers, inflation reports, and fiscal developments.',
    iconName: 'chart-bar',
    sectionGroup: 'news',
  },
  {
    id: 'companies',
    urlPath: '/rss/companies',
    categorySlug: 'business',
    titleEn: 'Companies',
    titleGu: 'કંપનીઓ',
    description:
      'Corporate earnings, business acquisitions, executive appointments, and company filings.',
    iconName: 'building-office',
    sectionGroup: 'news',
  },
  {
    id: 'personal-finance',
    urlPath: '/rss/personal-finance',
    categorySlug: 'personal-finance',
    titleEn: 'Personal Finance',
    titleGu: 'પર્સનલ ફાઇનાન્સ',
    description:
      'Smart investments, tax planning, mutual funds, EPF/PPF, and insurance guidance.',
    iconName: 'wallet',
    sectionGroup: 'special',
  },
  {
    id: 'gujarat',
    urlPath: '/rss/gujarat',
    categorySlug: 'gujarat',
    titleEn: 'Gujarat',
    titleGu: 'ગુજરાત',
    description:
      'Gujarat regional trade, APMC agricultural markets, industrial corridors, and local commerce.',
    iconName: 'map-pin',
    sectionGroup: 'news',
  },
  {
    id: 'india',
    urlPath: '/rss/india',
    categorySlug: 'india',
    titleEn: 'India',
    titleGu: 'ભારત',
    description:
      'National economic news, government policies, infrastructure projects, and banking updates.',
    iconName: 'flag',
    sectionGroup: 'news',
  },
  {
    id: 'global',
    urlPath: '/rss/global',
    categorySlug: 'world',
    titleEn: 'Global',
    titleGu: 'વૈશ્વિક',
    description:
      'International markets, US Fed actions, geopolitical impact, and global economic trends.',
    iconName: 'globe-alt',
    sectionGroup: 'news',
  },
  {
    id: 'commodities',
    urlPath: '/rss/commodities',
    categorySlug: 'commodity',
    titleEn: 'Commodities',
    titleGu: 'કોમોડિટીઝ',
    description:
      'Gold & silver rates, crude oil movements, agri-commodities, and precious metals analysis.',
    iconName: 'cube',
    sectionGroup: 'markets',
  },
];
