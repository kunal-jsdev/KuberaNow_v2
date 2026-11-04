import AdvertisementCard from './AdvertisementCard';

export default function RightSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={`flex w-full flex-col items-center gap-6 font-sans ${className}`}
    >
      <AdvertisementCard />
    </aside>
  );
}
