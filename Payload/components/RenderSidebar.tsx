import type { FC } from 'react';

import {
  filterSidebarWidgets,
  type SidebarPageContext,
  type SidebarWidget,
} from '@/Payload/lib/utilities/filterSidebarWidgets';
import type { Sidebar } from '@/payload-types';

import { SidebarAd } from './Sidebar/SidebarAd';
import { SidebarNews } from './Sidebar/SidebarNews';
import { SidebarVideo } from './Sidebar/SidebarVideo';

type WidgetSlug = SidebarWidget['blockType'];

const widgetComponents: Partial<Record<WidgetSlug, FC<any>>> = {
  sidebarAd: SidebarAd,
  sidebarNews: SidebarNews,
  sidebarVideo: SidebarVideo,
};

export const RenderSidebar = ({
  sidebar,
  context,
}: {
  sidebar?: Sidebar | null;
  context?: SidebarPageContext;
}) => {
  if (!sidebar?.widgets?.length) return null;

  const visibleWidgets = filterSidebarWidgets(sidebar.widgets, context);
  if (visibleWidgets.length === 0) return null;

  return (
    <>
      {visibleWidgets.map((widget: SidebarWidget, index: number) => {
        const WidgetComponent = widgetComponents[widget.blockType];

        if (!WidgetComponent) return null;

        return (
          <WidgetComponent
            key={widget.id ?? index}
            {...widget}
          />
        );
      })}
    </>
  );
};

export default RenderSidebar;
