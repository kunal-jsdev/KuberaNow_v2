import type { VideoPage } from '@/Payload/blocks/sidebar/visibility';
import type { NewsCategory, Sidebar } from '@/payload-types';

export type SidebarWidget = NonNullable<Sidebar['widgets']>[number];

export type SidebarPageContext = {
  pageType:
    'home' | 'article' | 'category' | 'tag' | 'market' | 'video' | 'other';
  categorySlug?: string | null;
  categoryId?: string | null;
  marketSlug?: string | null;
  tagSlug?: string | null;
  videoPage?: VideoPage;
};

export function isWidgetVisible(
  widget: SidebarWidget,
  context?: SidebarPageContext
): boolean {
  if (!context) {
    return true;
  }

  // "Select All Pages" only ticks the per-page checkboxes in the admin, so
  // those flags are the source of truth — trusting it here would keep a widget
  // on a page that was unticked while the stored flag was still true.
  switch (context.pageType) {
    case 'home':
      return Boolean(widget.showOnHome);

    case 'article':
      return Boolean(widget.showOnArticle);

    case 'tag':
      return Boolean(widget.showOnTag);

    case 'category': {
      if (!widget.showOnCategory) {
        return false;
      }

      // If no specific categories are selected, it targets "All Categories"
      if (!widget.categories || widget.categories.length === 0) {
        return true;
      }

      return widget.categories.some((cat: string | NewsCategory) => {
        if (typeof cat === 'object' && cat !== null) {
          if (context.categorySlug && cat.slug === context.categorySlug) {
            return true;
          }
          if (context.categoryId && cat.id === context.categoryId) {
            return true;
          }
          return false;
        }

        return context.categoryId && cat === context.categoryId;
      });
    }

    case 'market': {
      if (!widget.showOnMarket) {
        return false;
      }

      // If no specific market subpages are selected, it targets "All Market Pages"
      if (!widget.marketPages || widget.marketPages.length === 0) {
        return true;
      }

      if (context.marketSlug) {
        return widget.marketPages.includes(
          context.marketSlug as 'stocks' | 'crypto'
        );
      }

      return true;
    }

    case 'video': {
      // Widgets saved before video pages existed have no flag: keep them on.
      if (widget.showOnVideo === false) {
        return false;
      }

      // If no specific video pages are selected, it targets "All Video Pages"
      if (!widget.videoPages || widget.videoPages.length === 0) {
        return true;
      }

      return context.videoPage
        ? widget.videoPages.includes(context.videoPage)
        : true;
    }

    default:
      return true;
  }
}

export function filterSidebarWidgets(
  widgets?: Sidebar['widgets'] | null,
  context?: SidebarPageContext
): SidebarWidget[] {
  if (!widgets || !Array.isArray(widgets)) {
    return [];
  }

  return widgets.filter((widget) => isWidgetVisible(widget, context));
}
