import StaticSidebar from '@/components/sidebar/StaticSidebar';

export default function RootSidebar() {
  return <StaticSidebar context={{ pageType: 'home' }} />;
}
