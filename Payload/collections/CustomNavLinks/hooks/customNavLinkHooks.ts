import { revalidatePath, revalidateTag } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  FieldHook,
} from 'payload';

import type { CustomNavLink } from '@/payload-types';

type NavRef = { relationTo?: string; value?: unknown } | null | undefined;

type NavBlock = {
  blockType?: string;
  page?: NavRef;
  pages?: NavRef[] | null;
  [key: string]: unknown;
};

const revalidateNav = () => {
  revalidatePath('/', 'layout');
  revalidateTag('nav-config', 'max');
};

const refId = (ref: NavRef) => {
  const value = ref?.value;
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: unknown }).id);
  }
  return value === null || value === undefined ? '' : String(value);
};

const isRefTo = (ref: NavRef, id: string) =>
  ref?.relationTo === 'custom-nav-links' && refId(ref) === id;

export const HOME_SLUG = '/';

/**
 * Strips surrounding whitespace and slashes so "/why-kubera/" is stored as
 * "why-kubera". An empty slug or "/" means the home page and is stored as "/".
 */
export const normalizeNavLinkSlug: FieldHook = ({
  value,
  originalDoc,
  operation,
}) => {
  // Field omitted from a partial update: keep the stored slug.
  if (value === undefined && operation === 'update') return originalDoc?.slug;

  const slug =
    typeof value === 'string'
      ? value
          .trim()
          .toLowerCase()
          .replace(/^\/+|\/+$/g, '')
      : '';

  return slug || HOME_SLUG;
};

export const revalidateCustomNavLink: CollectionAfterChangeHook<
  CustomNavLink
> = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Custom nav link "${doc.slug}" changed — revalidating`);
    revalidateNav();
  }
  return doc;
};

/**
 * Removes every reference to the deleted link from the Navigation global (page
 * links, groups and the static pages dropdowns), so the next save of the
 * global does not fail on a missing relationship.
 */
export const removeCustomNavLinkFromNav: CollectionAfterDeleteHook<
  CustomNavLink
> = async ({ doc, req }) => {
  const { payload } = req;
  const id = String(doc.id);

  try {
    const navConfig = (await payload.findGlobal({
      slug: 'nav-config',
      depth: 0,
      overrideAccess: true,
      req,
    })) as unknown as Record<
      string,
      {
        navItems?: NavBlock[] | null;
        staticDropdown?: { staticDropdownPages?: NavRef[] | null } | null;
      }
    >;

    let changed = false;

    const cleanStaticDropdown = (
      staticDropdown?: { staticDropdownPages?: NavRef[] | null } | null
    ) => {
      const pages = staticDropdown?.staticDropdownPages;
      if (!staticDropdown || !Array.isArray(pages)) return staticDropdown;
      const kept = pages.filter((ref) => !isRefTo(ref, id));
      if (kept.length === pages.length) return staticDropdown;
      changed = true;
      return { ...staticDropdown, staticDropdownPages: kept };
    };

    const clean = (items?: NavBlock[] | null) =>
      (items ?? []).flatMap((item) => {
        if (item.blockType === 'pageLink' && isRefTo(item.page, id)) {
          changed = true;
          return [];
        }
        if (item.blockType === 'navGroup' && Array.isArray(item.pages)) {
          const pages = item.pages.filter((ref) => !isRefTo(ref, id));
          if (pages.length !== item.pages.length) {
            changed = true;
            return [{ ...item, pages }];
          }
        }
        return [item];
      });

    const header = {
      ...navConfig.header,
      navItems: clean(navConfig.header?.navItems),
      staticDropdown: cleanStaticDropdown(navConfig.header?.staticDropdown),
    };
    const hamburger = {
      ...navConfig.hamburger,
      navItems: clean(navConfig.hamburger?.navItems),
      staticDropdown: cleanStaticDropdown(navConfig.hamburger?.staticDropdown),
    };

    if (changed) {
      await payload.updateGlobal({
        slug: 'nav-config',
        data: { header, hamburger } as never,
        overrideAccess: true,
        req,
      });
    } else if (!req.context.disableRevalidate) {
      revalidateNav();
    }
  } catch (err) {
    payload.logger.error(
      { err },
      `Failed to remove custom nav link "${doc.slug}" from navigation`
    );
  }

  return doc;
};
