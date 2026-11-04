import { submitMorningBrief } from '@/app/(frontend)/actions/morningBrief';
import { SingleAdCard } from '@/components/AdvertisementCard';
import MorningBriefCard from '@/components/sidebar/MorningBriefCard';
import SidebarNewsCard from '@/components/sidebar/SidebarNewsCard';
import {
  ECONOMY_NEWS_SUMMARY_SECTIONS,
  MARKET_NEWS_SUMMARY_SECTIONS,
  PERSONAL_FINANCE_NEWS_SECTIONS,
} from '@/constants/sidebarNews';

import SidebarAdPromotion1 from '../../../../public/assets/sidebar-ad-promotion1.png';
import SidebarAdPromotion2 from '../../../../public/assets/sidebar-ad-promotion2.png';

export default function Page() {
  return (
    <>
      <SingleAdCard image={SidebarAdPromotion1} />
      <SidebarNewsCard {...MARKET_NEWS_SUMMARY_SECTIONS} />
      <SidebarNewsCard {...ECONOMY_NEWS_SUMMARY_SECTIONS} />
      <SingleAdCard image={SidebarAdPromotion2} />
      <SidebarNewsCard {...PERSONAL_FINANCE_NEWS_SECTIONS} />
      <MorningBriefCard action={submitMorningBrief} />
    </>
  );
}
