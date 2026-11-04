import type { SidebarNewsItem } from '../components/sidebar/SidebarNewsCard';

import {
  ECONOMY_PAGE_LINK,
  MARKET_PAGE_LINK,
  PERSONAL_FINANCE_PAGE_LINK,
} from './navigation';

export type SidebarNewsSection = {
  title: string;
  items: SidebarNewsItem[];
  seeMoreHref?: string;
};

export const MARKET_NEWS_SUMMARY_SECTIONS: SidebarNewsSection = {
  title: MARKET_PAGE_LINK.label,
  seeMoreHref: MARKET_PAGE_LINK.href,
  items: [
    {
      id: 'market-1',
      headline: 'ICICI બેંકનો નફો 24% વધ્યો, મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું.',
    },
    {
      id: 'market-2',
      headline: 'RBI એ રેપો રેટ 6.25% પર સ્થિર રાખ્યો, ફુગાવો અનુમાન ઘટાડ્યું',
    },
    {
      id: 'market-3',
      headline: 'ઈન્ફોસિસે Q4 માં મજબૂત ડીલ વિન્સ બાદ FY27 ગાઈડન્સ વધારી.',
    },
    {
      id: 'market-4',
      headline:
        'L&T ને મધ્ય પૂર્વમાં ₹15,000 કરોડનો સૌથી મોટો EPC કોન્ટ્રાક્ટ મળ્યો',
    },
  ],
};

export const ECONOMY_NEWS_SUMMARY_SECTIONS: SidebarNewsSection = {
  title: ECONOMY_PAGE_LINK.label,
  seeMoreHref: ECONOMY_PAGE_LINK.href,
  items: [
    {
      id: 'ec-1',
      headline: 'ICICI બેંકનો નફો 24% વધ્યો, મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું.',
    },
    {
      id: 'ec-2',
      headline: 'RBI એ રેપો રેટ 6.25% પર સ્થિર રાખ્યો, ફુગાવો અનુમાન ઘટાડ્યું',
    },
    {
      id: 'ec-3',
      headline: 'ઈન્ફોસિસે Q4 માં મજબૂત ડીલ વિન્સ બાદ FY27 ગાઈડન્સ વધારી.',
    },
    {
      id: 'ec-4',
      headline:
        'L&T ને મધ્ય પૂર્વમાં ₹15,000 કરોડનો સૌથી મોટો EPC કોન્ટ્રાક્ટ મળ્યો',
    },
  ],
};
export const PERSONAL_FINANCE_NEWS_SECTIONS: SidebarNewsSection = {
  title: PERSONAL_FINANCE_PAGE_LINK.label,
  seeMoreHref: PERSONAL_FINANCE_PAGE_LINK.href,
  items: [
    {
      id: 'pf-1',
      headline: 'ICICI બેંકનો નફો 24% વધ્યો, મેનેજમેન્ટે ગાઈડન્સ સુધાર્યું.',
    },
    {
      id: 'pf-2',
      headline: 'RBI એ રેપો રેટ 6.25% પર સ્થિર રાખ્યો, ફુગાવો અનુમાન ઘટાડ્યું',
    },
    {
      id: 'pf-3',
      headline: 'ઈન્ફોસિસે Q4 માં મજબૂત ડીલ વિન્સ બાદ FY27 ગાઈડન્સ વધારી.',
    },
    {
      id: 'pf-4',
      headline:
        'L&T ને મધ્ય પૂર્વમાં ₹15,000 કરોડનો સૌથી મોટો EPC કોન્ટ્રાક્ટ મળ્યો',
    },
  ],
};
