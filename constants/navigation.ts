import facebook from '../public/assets/fb.svg';
import instagram from '../public/assets/insta.svg';
import linkedin from '../public/assets/linkedin.svg';
import telegram from '../public/assets/teli.svg';
import whatsapp from '../public/assets/wp.svg';
import x from '../public/assets/x.svg';
import youtube from '../public/assets/yt.svg';

export const NAV_PREVIEW_ENABLED = false;

export const COMPANY_DROPDOWN_LINKS = [
  { label: 'Economy', href: '/economy' },
  { label: 'Corporates', href: '/corporates' },
  { label: 'Advertisement', href: '/advertise-with-us' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
];

export const MAIN_NAV_LINKS = [
  { label: 'Market', href: '/market' },
  { label: 'IPO ', href: '/ipo' },
  { label: 'Economy', href: '/economy' },
  { label: 'Companies ', href: '/business' },
  { label: 'Personal Finance', href: '/personal-finance' },
  { label: 'Gujarat', href: '/gujarat' },
  { label: 'India', href: '/india' },
  { label: 'Global', href: '/world' },
];

export const KUBERA_NOW_DROPDOWN = [
  { label: 'Why Kubera', href: '/why-kubera' },
  { label: 'About Us', href: '/about-us-kubera-now' },
  { label: 'Advertise With Us', href: '/advertise-with-us' },
  { label: 'Careers', href: '/careers' },
  { label: 'Leadership', href: '/leadership-team' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'RSS Feed', href: '/rss.xml' },
];

export const MARKET_LINKS = [
  { label: 'Live Market', href: '/market' },
  { label: 'Stocks', href: '/market/stocks' },
  { label: 'Mutual Funds', href: '/market/mutual-funds' },
  { label: 'IPO', href: '/ipo' },
  { label: 'Commodities', href: '/commodity' },
  { label: 'Cryptocurrency', href: '/market/crypto' },
];

export const NEWS_LINKS = [
  { label: 'Economy', href: '/economy' },
  { label: 'Companies', href: '/business' },
  { label: 'Personal Finance', href: '/personal-finance' },
  { label: 'Gujarat', href: '/gujarat' },
  { label: 'India', href: '/india' },
  { label: 'Global', href: '/world' },
];

export const TOOL_LINKS = [
  { label: 'SIP Calculator', href: '/tools/sip' },
  { label: 'FD Calculator', href: '/tools/fd' },
  { label: 'EMI Calculator', href: '/tools/emi' },
  { label: 'Tax Calculator', href: '/tools/tax' },
  { label: 'SWP Calculator', href: '/tools/swp' },
];

export const COMPANY_LINKS = [
  { label: 'About Us', href: '/about-us-kubera-now' },
  { label: 'Advertisement', href: '/advertise-with-us' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
];

export const BOTTOM_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

export const MARKET_DROPDOWN_LINKS = [
  { label: 'Stocks', href: '/stock-market' },
  { label: 'Bullion Market', href: '/bullion' },
  { label: 'Cryptocurrency', href: '/crypto' },
  { label: 'Mutual Funds', href: '/mutual-funds' },
  { label: 'Currencies', href: '/currencies' },
  { label: 'IPO', href: '/ipo' },
  { label: 'Commodities', href: '/commodities' },
];

export const MORE_DROPDOWN_LINKS = [
  { label: 'About', href: '/about-us-kubera-now' },
  { label: 'Advertisement', href: '/advertise-with-us' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
];
export const OTHER_DROPDOWN_LINKS = [
  { label: 'Economy', href: '/economy' },
  { label: 'Corporates', href: '/corporates' },
  { label: 'Personal Finance', href: '/personal-finance' },
  { label: 'Automobiles', href: '/automobiles' },
  { label: 'Entertainment', href: '/entertainment' },
  { label: 'Gujarat', href: '/gujarat' },
  { label: 'India', href: '/india' },
];
export const DESKTOP_NAV_LINKS = [...OTHER_DROPDOWN_LINKS];
export const DROPDOWN_LINKS = [
  { label: 'Market', items: MARKET_DROPDOWN_LINKS },
  // { label: 'Company', items: COMPANY_DROPDOWN_LINKS },
  { label: 'Other', items: OTHER_DROPDOWN_LINKS },
  { label: 'More', items: MORE_DROPDOWN_LINKS },
];
export const FOOTER_LINKS = [
  { title: 'Markets', links: MARKET_LINKS },
  { title: 'News', links: NEWS_LINKS },
  { title: 'Tools', links: TOOL_LINKS },
  { title: 'Company', links: KUBERA_NOW_DROPDOWN },
];
export const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/kuberanow',
    icon: instagram,
    isInstagram: true,
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61590120462544',
    icon: facebook,
  },
  {
    name: 'X',
    href: 'https://x.com/KuberaNow17430',
    icon: x,
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@KuberaNow',
    icon: youtube,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/kuberanow/home',
    icon: linkedin,
  },
  {
    name: 'WhatsApp',
    href: 'https://whatsapp.com/channel/0029VbDPNhHISTkJEDTirJ16',
    icon: whatsapp,
  },
  {
    name: 'Telegram',
    href: 'https://t.me/Kubera_now_Gujarati',
    icon: telegram,
  },
];

type ShareTarget = {
  name: string;
  icon: typeof instagram;
  href: (url: string) => string;
};

export const SHARE_TARGETS: readonly ShareTarget[] = [
  {
    name: 'WhatsApp',
    icon: whatsapp,
    href: (url) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: facebook,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'X',
    icon: x,
    href: (url) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: linkedin,
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

export const COMING_SOON_ROUTES = [
  '/market/mutual-funds',
  '/market/commodities',
  '/market/bullion',
  '/market/currencies',
  '/news/india',
  '/news/personal-finance',
  '/news/technology',
  '/news/gujarat',
  '/news/national',
  '/news/global',
  '/news/entertainment',
  '/tools/sip',
  '/tools/fd',
  '/tools/emi',
  '/tools/tax',
  '/tools/swp',
  '/more/economy',
  '/more/finance',
  '/more/technology',
  '/more/gujarat',
  '/more/national',
  '/more/global',
  '/more/entertainment',
];
export const staticRoutes = [
  '/about-us-kubera-now',
  '/privacy-policy',
  '/terms-of-use',
  '/careers',
  '/advertise-with-us',
  '/contact-us',
  '/disclaimer',
  '/stocks',
  '/crypto',
];

export const EXCLUDE_SIDEBAR_ROUTES: string[] = [];

/**
 * Routes (by prefix) whose sidebar sits beside the content on desktop (`lg`)
 * only — tablets show none. On phones the video listings and video detail
 * render it under their content; the shorts detail has none.
 */
export const DESKTOP_ONLY_SIDEBAR_PREFIXES = ['/videos', '/short-videos'];

/** Routes (by prefix) with no footer at any screen size (the shorts detail feed). */
export const NO_FOOTER_PREFIXES = ['/short-videos/'];

export const SIDEBAR_MAIN_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Market', href: '/market' },
  { label: 'Economy', href: '/economy' },
  { label: 'Companies', href: '/business' },
  { label: 'IPO', href: '/ipo' },
  { label: 'Personal Finance', href: '/personal-finance' },
  { label: 'Gujarat', href: '/gujarat' },
  { label: 'India', href: '/india' },
  { label: 'Global', href: '/world' },
];

export const MARKET_PAGE_LINK = { href: '/market', label: 'Market' };
export const ECONOMY_PAGE_LINK = { href: '/economy', label: 'Economy' };
export const PERSONAL_FINANCE_PAGE_LINK = {
  href: '/personal-finance',
  label: 'Personal Finance',
};
export const RECENT_SEARCH_ITEMS = [
  {
    id: 1,
    headline: 'ઈન્ફોસિસે Q4 માં મજબૂત ડીલ વિન્સ...',
    category: 'Commodities',
  },
  {
    id: 2,
    headline: 'સેન્સેક્સ ટુડે | સ્ટોક માર્કેટ LIVE અપડેટ: નિફ્ટી 23,600 ની...',
    category: 'Equity',
  },
];
