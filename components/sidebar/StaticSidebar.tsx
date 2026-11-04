import RenderSidebar from '@/Payload/components/RenderSidebar';
import type { SidebarPageContext } from '@/Payload/lib/utilities/filterSidebarWidgets';
import { getSidebar } from '@/Payload/lib/utilities/getSidebar';

type StaticSidebarProps = {
  slug?: string;
  context?: SidebarPageContext;
};

export default async function StaticSidebar({
  slug,
  context,
}: StaticSidebarProps = {}) {
  let sidebar = slug ? await getSidebar(slug) : null;

  if (!sidebar) {
    sidebar = await getSidebar('common-sidebar');
  }

  return (
    <RenderSidebar
      sidebar={sidebar}
      context={context}
    />
  );
}
