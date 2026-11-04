import StaticSidebar from '@/components/sidebar/StaticSidebar';

type Args = {
  params: Promise<{ tagSlug: string }>;
};

export default async function Page({ params }: Args) {
  const { tagSlug } = await params;
  return (
    <StaticSidebar
      context={{
        pageType: 'tag',
        tagSlug: decodeURIComponent(tagSlug),
      }}
    />
  );
}
