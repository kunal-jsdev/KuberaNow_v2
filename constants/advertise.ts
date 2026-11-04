import type { StaticImageData } from 'next/image';

import AntalaBannerAdAllPages from '@/public/assets/upper_banner_app_pages.png';
import AntalaBannerAd from '@/public/assets/upper_banner_only_antala_page.png';

export const ADVERTISE_FORM_ID = '6a75894b242d3fd118a16fe9';

export const LEADERBOARD_AD_IMAGE: StaticImageData | string =
  AntalaBannerAdAllPages;
export const LEADERBOARD_AD_IMAGE_ANTALA: StaticImageData | string =
  AntalaBannerAd;
export const LEADERBOARD_AD_REDIRECT_URL = `${(
  process.env.NEXT_PUBLIC_SERVER_URL || 'https://kuberanow.com'
).replace(/\/+$/, '')}/antala-ipo`;
export const LEADERBOARD_AD_REDIRECT_URL_ANTALA = 'https://antalalimited.in/';

export const ADVERTISE_HERO = {
  title: 'Advertise with Us',
  subtitle: 'Reach the Heart of Gujarati Business India',
  description:
    "KuberaNow is not just a news digital TV. It is a trusted daily companion for Gujarat's most economically active and commercially influential audience. When you advertise with KuberaNow, you are not merely buying airtime or digital impressions — you are earning the attention, trust, and consideration of a community that has always put business first.",
};

export const ADVERTISE_FORMATS = [
  {
    id: 'digital',
    title: 'Digital & Web',
    items: [
      'Pre-Roll & Mid-Roll Video Ads: 15 to 30 second non-skippable and skippable video ads on our website and YouTube channel.',
      'Homepage & Section Display Banners: High-visibility banner placements (Billboard, Leaderboard, MREC) across the website.',
      "Sponsored Articles & Native Content: Long-form branded editorial content crafted in KuberaNow's voice, clearly marked as sponsored.",
      'Push Notification Campaigns: Branded breaking news alerts to opted-in subscribers.',
    ],
  },
  {
    id: 'television',
    title: 'Live Stream',
    items: [
      '30-Second and 60-Second Commercial Spots: Premium placement in prime-time business bulletins, market opening/closing segments, and special programming.',
      'Programme Sponsorship: Exclusive sponsor of flagship shows such as morning market reports, evening business summaries, and weekly sector specials.',
      'Lower Third Branded Tickers: Branded data scrolls appearing during live market updates.',
      'In-Studio Brand Integration: Tasteful brand presence within the studio set during editorial programming.',
    ],
  },
  {
    id: 'newsletter',
    title: 'Newsletter & Email Marketing',
    items: [
      "Morning Business Briefing Sponsorship: Exclusive sponsorship of KuberaNow's daily subscriber newsletter, delivered to verified business professionals.",
      'Dedicated Email Campaigns: Custom-designed emails sent to segmented audience lists on behalf of advertisers.',
    ],
  },
  {
    id: 'social',
    title: 'Social Media',
    items: [
      "Branded Content Posts: Sponsored content across KuberaNow's Facebook, Instagram, X (Twitter), and LinkedIn channels.",
      'Reel & Short Video Sponsorship: Branded tags on high-performing short-form content.',
      'Live Session Sponsors: Exclusive branding during KuberaNow Facebook and YouTube Live sessions.',
    ],
  },
] as const;

export const ADVERTISE_AUDIENCE = {
  badge: 'Our Audience',
  intro:
    'KuberaNow reaches an affluent, engaged, and financially empowered audience that is actively looking for products, services, and investment opportunities. Our core viewership profile:',
  profile: [
    {
      id: 'language',
      text: 'Gujarati (with English business terminology literacy)',
    },
    {
      id: 'geography',
      text: 'Gujarat (primary) | Pan-India Gujarati diaspora | Global NRG communities (USA, UK, UAE, Canada, Australia)',
    },
    {
      id: 'age',
      text: '25 – 60 years (peak: 30 – 50)',
    },
    {
      id: 'profession',
      text: 'Entrepreneurs, SME owners, traders, MSME operators, investors, CXOs, finance professionals.',
    },
    {
      id: 'income',
      text: 'Middle to upper-income; high disposable income; active investment behaviour',
    },
    {
      id: 'platforms',
      text: 'TV, digital web, mobile app, social media, YouTube',
    },
  ],
} as const;

export const ADVERTISE_CTA = {
  highlight: 'Ready to Reach',
  title: "Gujarat's Business Audience?",
  description:
    'Contact our Business Development team today for a customised media kit, audience insights, and campaign packages tailored to your brand objectives.',
  phone: '+91 99042 77760',
  email: 'info@kuberanow.com',
};

export const ADVERTISE_WHY = {
  title: 'Why Advertise with KuberaNow?',
  benefits: [
    {
      title: 'Unmatched Reach',
      description:
        "Access Gujarat's most commercially active audience through the only dedicated Gujarati-language business news platform.",
    },
    {
      title: 'High-Intent Audience',
      description:
        'Our viewers are active decision-makers — business owners and investors who act on the information they consume.',
    },
    {
      title: 'Brand Trust by Association',
      description:
        'Advertising with a credible, independent business digital TV significantly elevates brand perception among discerning business consumers.',
    },
    {
      title: 'Multi-Platform Presence',
      description:
        'Your brand travels with your audience — from TV to mobile to social media — through integrated multi-platform campaigns.',
    },
  ],
} as const;

export const ADVERTISE_DISCLAIMER =
  'KuberaNow offers transparent, ethical, and clearly labelled commercial arrangements. Sponsored and branded content is always disclosed to our audience in accordance with the guidelines of the Press Council of India and applicable digital advertising standards.';
