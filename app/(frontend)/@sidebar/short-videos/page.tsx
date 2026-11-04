import StaticSidebar from '@/components/sidebar/StaticSidebar';

export default function Page() {
  return <StaticSidebar context={{ pageType: 'video', videoPage: 'shorts' }} />;
}
