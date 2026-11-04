import { submitMorningBrief } from '@/app/(frontend)/actions/morningBrief';
import { SingleAdCard } from '@/components/AdvertisementCard';
import MorningBriefCard from '@/components/sidebar/MorningBriefCard';
import SidebarIpoPoster from '@/public/assets/new-ipo-poster.png';
import SidebarAdPromotion1 from '@/public/assets/sidebar-ad-promotion1.png';
import SidebarAdPromotion2 from '@/public/assets/sidebar-ad-promotion2.png';

export default async function PageStaticSidebar({
  isIpoRoute = false,
}: {
  isIpoRoute?: boolean;
} = {}) {
  return (
    <>
      <SingleAdCard
        image={isIpoRoute ? SidebarAdPromotion1 : SidebarIpoPoster}
        disableLink={isIpoRoute}
        className={`${isIpoRoute ? '' : '[&_img]:border [&_img]:border-[#E5E7EB] [&_img]:shadow-md'}`}
      />
      <SingleAdCard
        image={SidebarAdPromotion2}
        disableLink
      />
      <MorningBriefCard action={submitMorningBrief} />
    </>
  );
}
