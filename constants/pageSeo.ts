export const CATEGORY_PAGE_SEO: Record<
  string,
  { title: string; h1: string; description?: string }
> = {
  market: {
    title: 'Stock Market News Today, Nifty, Sensex & Shares Updates KuberaNow',
    h1: 'Stock Market News',
  },
  economy: {
    title:
      'India Economy News, GDP, RBI, Inflation, Policy & Economic Updates KuberaNow',
    h1: 'India Economy News',
    description:
      'Stay updated with India economy news, GDP, inflation, RBI policies, government decisions, MSMEs, budget updates and economic analysis.',
  },
  business: {
    title:
      'Business News India – Companies, Startups & Corporate Updates KuberaNow',
    h1: 'Business News India',
    description:
      'Latest business news from India covering companies, startups, MSMEs, corporate developments, business leaders, deals and industry trends.',
  },
  'personal-finance': {
    title:
      'Personal Finance India – Investment, Savings & Money Tips KuberaNow',
    h1: 'Personal Finance India',
    description:
      'Practical personal finance insights covering investments, savings, mutual funds, loans, taxes, retirement planning and wealth creation in India.',
  },
  gujarat: {
    title:
      'Gujarat Business News, Economy, Market & Companies Updates KuberaNow',
    h1: 'Gujarat Business News',
    description:
      "Latest Gujarat business news, economy updates, industries, markets, companies, investments and developments shaping the state's business landscape.",
  },
  india: {
    title: 'India Business News, Economy, Market & Companies Updates KuberaNow',
    h1: 'India Business News',
    description:
      'Latest India business, economy, market and policy news with analysis of developments affecting investors, entrepreneurs and businesses.',
  },
  world: {
    title: 'World Business News & Global Economy Updates KuberaNow',
    h1: 'World Business News',
    description:
      'Global business news, international markets, world economy, trade, currencies and major developments affecting businesses and investors worldwide.',
  },

  ipo: {
    title: 'IPO News, Upcoming IPOs, GMP KuberaNow',
    h1: 'IPO News',
    description:
      'Get the latest IPO news, upcoming IPOs, grey market premium (GMP) and listing updates for Indian stock market investors.',
  },
};

export const STATIC_PAGE_SEO = {
  whyKubera: {
    title:
      'Why KuberaNow? – Gujarat’s Business & Financial Media Platform KuberaNow',
    h1: 'Why KuberaNow',
  },
  about: {
    title: 'About KuberaNow – Gujarati Business & Financial Media KuberaNow',
    h1: 'About KuberaNow',
  },
  advertise: {
    title:
      'Advertise With KuberaNow – Reach Gujarat’s Business Audience KuberaNow',
    h1: 'Advertise With KuberaNow',
  },
  careers: {
    title: 'Careers at KuberaNow – Jobs & Opportunities KuberaNow',
    h1: 'Careers at KuberaNow',
    description:
      'Explore career opportunities at KuberaNow and join a growing business media platform focused on Gujarat, India and global markets.',
  },
  leadership: {
    title: 'Leadership Team – Editorial & Executive Leaders KuberaNow',
    h1: 'Leadership',
    description:
      'Meet the KuberaNow team of experienced leaders, journalists, editors, analysts, and media professionals delivering trusted business and financial news.',
  },
  contact: {
    title: 'Contact KuberaNow – Business & Financial Media KuberaNow',
    h1: 'Contact KuberaNow',
  },
  disclaimer: { title: 'Disclaimer – KuberaNow', h1: 'Disclaimer' },
  privacy: { title: 'Privacy Policy – KuberaNow', h1: 'Privacy Policy' },
  terms: {
    title: 'Terms of Use – KuberaNow',
    h1: 'Terms of Use',
    description:
      'Read the KuberaNow Terms of Use covering website access, content standards, intellectual property, user responsibilities and other conditions.',
  },
} as const;

export const VIDEO_PAGE_SEO = {
  videos: {
    path: '/videos',
    schemaPath: '/videos',
    breadcrumbName: 'Videos',
    title: 'બિઝનેસ વિડિયો સમાચાર | Business Videos in Gujarati',
    description:
      'બિઝનેસ વિડિયો સમાચાર (Business Videos in Gujarati): શેરબજાર, IPO, સ્ટાર્ટઅપ ફંડિંગ, કંપની પરિણામ અને RBI પોલિસી એનાલિસિસના વિડિયો KuberaNow પર.',
    keywords: [
      'બિઝનેસ વિડિયો',
      'ગુજરાતી વિડિયો સમાચાર',
      'શેર બજાર વિડિયો',
      'માર્કેટ એનાલિસિસ',
      'business videos in Gujarati',
      'stock market videos',
      'KuberaNow videos',
    ],
    primaryKeyword: 'બિઝનેસ વિડિયો સમાચાર / business videos in gujarati',
  },
  shorts: {
    path: '/short-videos',
    schemaPath: '/short-videos/',
    breadcrumbName: 'Short Videos',
    title: 'બિઝનેસ શોર્ટ્સ વિડિયો | Business Short Videos in Gujarati',
    description:
      'બિઝનેસ શોર્ટ્સ વિડિયો (Business Short Videos): શેરબજારના તાજા અપડેટ્સ, સ્ટાર્ટઅપ ફંડામેન્ટલ્સ, રોકાણ અને ઝડપી બિઝનેસ ઇનસાઇટ્સ સંબંધિત શોર્ટ્સ KuberaNow પર.',
    keywords: [
      'બિઝનેસ શોર્ટ્સ',
      'ગુજરાતી શોર્ટ્સ વિડિયો',
      'શેર બજાર શોર્ટ્સ',
      'માર્કેટ રિલ્સ',
      'business shorts Gujarati',
      'short market videos',
      'KuberaNow shorts',
    ],
    primaryKeyword: 'બિઝનેસ શોર્ટ્સ વિડિયો / business shorts in gujarati',
  },
} as const;
