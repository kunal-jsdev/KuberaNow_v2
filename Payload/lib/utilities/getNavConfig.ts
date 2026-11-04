import { cache } from 'react';

import configPromise from '@payload-config';
import { getPayload } from 'payload';

import type { CustomNavLink, NewsCategory } from '@/payload-types';

/**
 * Structure for a direct category link in the nav
 */
export type NavCategoryLink = {
  label: string;
  href: string;
  slug: string;
  showNew?: boolean;
};

/**
 * Structure for a dropdown group in the nav
 */
export type NavGroupLink = {
  label: string;
  href: string;
  slug: string;
  showNew?: boolean;
  items?: NavCategoryLink[];
};

export type StaticHeaderDropdown = {
  label: string;
  enabled: boolean;
  /** Pages picked in the CMS; empty means "use the built-in default list". */
  items?: NavCategoryLink[];
};

/**
 * Combined navigation configuration for Header and Hamburger
 */
export type NavConfigData = {
  header: {
    categories: NavCategoryLink[];
    groups: NavGroupLink[];
    ordered: (NavCategoryLink | NavGroupLink)[];
  };
  hamburger: {
    categories: NavCategoryLink[];
    groups: NavGroupLink[];
    ordered: (NavCategoryLink | NavGroupLink)[];
  };
  /**
   * Top-level aliases pointing to header categories and groups
   * for backward compatibility.
   */
  categories: NavCategoryLink[];
  groups: NavGroupLink[];
  allSlugs: string[]; // All unique category slugs across header & hamburger
  tagSlugs: string[]; // All unique tag slugs (custom links to "tag/<slug>") across header & hamburger
  staticHeaderDropdown: StaticHeaderDropdown | null;
  staticHamburgerDropdown: StaticHeaderDropdown | null;
};

/** Custom nav links store the home page as "/", everything else without it. */
const toNavHref = (slug: string) =>
  slug === '/' ? '/' : `/${slug.replace(/^\/+/, '')}`;

type ResolvedNavRef = {
  title: string;
  slug: string;
  isCategory: boolean;
};

/**
 * Resolves a populated nav relationship into a title/slug pair. Handles the
 * polymorphic `{ relationTo, value }` shape (category or custom nav link) and
 * the legacy shape where the value is the category document itself.
 */
function resolveNavRef(raw: unknown): ResolvedNavRef | null {
  if (!raw || typeof raw !== 'object') return null;

  const isPolymorphic = 'relationTo' in raw && 'value' in raw;
  const relationTo = isPolymorphic
    ? (raw as { relationTo: string }).relationTo
    : 'news-categories';
  const doc = isPolymorphic ? (raw as { value: unknown }).value : raw;

  if (!doc || typeof doc !== 'object') return null;

  const { title, slug } = doc as Pick<
    NewsCategory | CustomNavLink,
    'title' | 'slug'
  >;
  if (!slug || !title) return null;

  return { title, slug, isCategory: relationTo === 'news-categories' };
}

/** Path prefix of tag pages (`/tag/[tagSlug]`), without the leading "/". */
export const TAG_PATH_PREFIX = 'tag/';

/** Tag slug for a custom nav link pointing at a tag page, otherwise null. */
function getTagSlug(ref: ResolvedNavRef): string | null {
  if (ref.isCategory || !ref.slug.startsWith(TAG_PATH_PREFIX)) return null;
  const tagSlug = ref.slug.slice(TAG_PATH_PREFIX.length);
  return tagSlug && !tagSlug.includes('/') ? tagSlug : null;
}

/** Records a link's slug if it can show a story preview (category or tag). */
function collectPreviewSlug(
  ref: ResolvedNavRef,
  slugSet: Set<string>,
  tagSlugSet: Set<string>
) {
  if (ref.isCategory) {
    slugSet.add(ref.slug);
    return;
  }
  const tagSlug = getTagSlug(ref);
  if (tagSlug) tagSlugSet.add(tagSlug);
}

/**
 * Turns the static dropdown's picked pages into links, skipping missing ones.
 * Category and tag pages among them are recorded so they get story previews.
 */
function parseStaticDropdownPages(
  raw: unknown,
  slugSet: Set<string>,
  tagSlugSet: Set<string>
): NavCategoryLink[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((page) => {
    const ref = resolveNavRef(page);
    if (!ref) return [];
    collectPreviewSlug(ref, slugSet, tagSlugSet);
    return [{ label: ref.title, href: toNavHref(ref.slug), slug: ref.slug }];
  });
}

/**
 * Helper to parse unified blocks (pageLink & navGroup) into structured links.
 */
function parseNavBlocks(items: any[] | null | undefined): {
  categories: NavCategoryLink[];
  groups: NavGroupLink[];
  ordered: (NavCategoryLink | NavGroupLink)[];
  slugs: string[];
  tagSlugs: string[];
} {
  const categories: NavCategoryLink[] = [];
  const groups: NavGroupLink[] = [];
  const ordered: (NavCategoryLink | NavGroupLink)[] = [];
  const slugSet = new Set<string>();
  const tagSlugSet = new Set<string>();

  const collectSlug = (ref: ResolvedNavRef) =>
    collectPreviewSlug(ref, slugSet, tagSlugSet);

  if (!items || !Array.isArray(items)) {
    return { categories, groups, ordered, slugs: [], tagSlugs: [] };
  }

  for (const item of items) {
    if (item.enabled === false) continue;

    if (item.blockType === 'pageLink') {
      const ref = resolveNavRef(item.page);
      if (!ref) continue;

      const catLink: NavCategoryLink = {
        label: ref.title,
        href: toNavHref(ref.slug),
        slug: ref.slug,
        showNew: Boolean(item.showNew),
      };
      categories.push(catLink);
      ordered.push(catLink);

      collectSlug(ref);
    } else if (item.blockType === 'navGroup') {
      const rawTitle = typeof item.title === 'string' ? item.title.trim() : '';

      const category =
        item.category && typeof item.category !== 'string'
          ? (item.category as NewsCategory)
          : null;

      const groupTitle = rawTitle || category?.title;
      if (!groupTitle) continue;

      const groupSlug =
        category?.slug || groupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const groupHref = category?.slug ? `/${category.slug}` : '#';

      const groupLink: NavGroupLink = {
        label: groupTitle,
        href: groupHref,
        slug: groupSlug,
        showNew: Boolean(item.showNew),
        items: [],
      };

      if (category?.slug) {
        slugSet.add(category.slug);
      }

      // Process the group's pages (categories and custom nav links)
      const rawCategories = item.pages || item.categories || item.subCategories;
      if (rawCategories && Array.isArray(rawCategories)) {
        for (const sub of rawCategories) {
          const subRef = resolveNavRef(
            typeof sub === 'object' && sub !== null && 'category' in sub
              ? (sub as { category: unknown }).category
              : sub
          );

          if (subRef) {
            groupLink.items!.push({
              label: subRef.title,
              href: toNavHref(subRef.slug),
              slug: subRef.slug,
            });
            collectSlug(subRef);
          }
        }
      } else if (item.subCategory) {
        const subCategory =
          typeof item.subCategory === 'string'
            ? null
            : (item.subCategory as NewsCategory);

        if (subCategory?.slug) {
          groupLink.items!.push({
            label: subCategory.title,
            href: `/${subCategory.slug}`,
            slug: subCategory.slug,
          });
          slugSet.add(subCategory.slug);
        }
      }

      groups.push(groupLink);
      ordered.push(groupLink);
    }
  }

  return {
    categories,
    groups,
    ordered,
    slugs: Array.from(slugSet),
    tagSlugs: Array.from(tagSlugSet),
  };
}

/**
 * Fetch and transform the NavConfig global into a format
 * ready for the frontend navigation components (Header and Hamburger).
 */
export const getNavConfig = cache(async (): Promise<NavConfigData> => {
  const payload = await getPayload({ config: configPromise });

  try {
    const navConfig = await payload.findGlobal({
      slug: 'nav-config' as any,
      depth: 1,
      overrideAccess: false,
    });

    const slugSet = new Set<string>();
    const tagSlugSet = new Set<string>();

    // 1. Process Header Items (checks header.navItems, headerNavItems, or legacy navItems)
    const headerRaw =
      (navConfig as any).header?.navItems ||
      (navConfig as any).headerNavItems ||
      (navConfig as any).navItems;

    const headerParsed = parseNavBlocks(headerRaw);
    const headerCategories = headerParsed.categories;
    const headerGroups = headerParsed.groups;
    headerParsed.slugs.forEach((slug) => slugSet.add(slug));
    headerParsed.tagSlugs.forEach((slug) => tagSlugSet.add(slug));

    // 2. Process Hamburger Items
    const hamburgerRaw =
      (navConfig as any).hamburger?.navItems ||
      (navConfig as any).hamburgerNavItems;

    const hamburgerParsed = parseNavBlocks(hamburgerRaw);
    const hamburgerCategories = hamburgerParsed.categories;
    const hamburgerGroups = hamburgerParsed.groups;
    hamburgerParsed.slugs.forEach((slug) => slugSet.add(slug));
    hamburgerParsed.tagSlugs.forEach((slug) => tagSlugSet.add(slug));

    // Only the header's static dropdown shows story previews, and only when
    // it is enabled — otherwise its slugs are not fetched.
    const headerStaticEnabled =
      (navConfig as any).header?.staticDropdown?.staticDropdownEnabled !==
      false;
    const staticHeaderDropdown = {
      label:
        typeof (navConfig as any).header?.staticDropdown
          ?.staticDropdownLabel === 'string' &&
        (navConfig as any).header.staticDropdown.staticDropdownLabel.trim()
          ? (navConfig as any).header.staticDropdown.staticDropdownLabel.trim()
          : 'Kubera Now',
      enabled: headerStaticEnabled,
      items: parseStaticDropdownPages(
        (navConfig as any).header?.staticDropdown?.staticDropdownPages,
        headerStaticEnabled ? slugSet : new Set(),
        headerStaticEnabled ? tagSlugSet : new Set()
      ),
    };

    const staticHamburgerDropdown = {
      label:
        typeof (navConfig as any).hamburger?.staticDropdown
          ?.staticDropdownLabel === 'string' &&
        (navConfig as any).hamburger.staticDropdown.staticDropdownLabel.trim()
          ? (
              navConfig as any
            ).hamburger.staticDropdown.staticDropdownLabel.trim()
          : 'Kubera Now',
      enabled:
        (navConfig as any).hamburger?.staticDropdown?.staticDropdownEnabled !==
        false,
      // The hamburger accordion has no story previews.
      items: parseStaticDropdownPages(
        (navConfig as any).hamburger?.staticDropdown?.staticDropdownPages,
        new Set(),
        new Set()
      ),
    };

    // Process legacy navCategories (direct links) if header was empty
    const rawNavCategories = (navConfig as any).navCategories;
    if (
      headerCategories.length === 0 &&
      rawNavCategories &&
      Array.isArray(rawNavCategories)
    ) {
      for (const item of rawNavCategories) {
        if (item.enabled === false || !item.category) continue;

        const category =
          typeof item.category === 'string'
            ? null
            : (item.category as NewsCategory);

        if (!category?.slug) continue;

        headerCategories.push({
          label: category.title,
          href: `/${category.slug}`,
          slug: category.slug,
        });

        slugSet.add(category.slug);
      }
    }

    // Process legacy navGroups (dropdown groups) if header was empty
    const rawNavGroups = (navConfig as any).navGroups;
    if (
      headerGroups.length === 0 &&
      rawNavGroups &&
      Array.isArray(rawNavGroups)
    ) {
      for (const group of rawNavGroups) {
        if (group.enabled === false || !group.category) continue;

        const category =
          typeof group.category === 'string'
            ? null
            : (group.category as NewsCategory);

        if (!category?.slug) continue;

        const groupLink: NavGroupLink = {
          label: category.title,
          href: `/${category.slug}`,
          slug: category.slug,
          items: [],
        };

        slugSet.add(category.slug);

        if (group.subCategories && Array.isArray(group.subCategories)) {
          for (const subItem of group.subCategories) {
            if (!subItem.category) continue;

            const subCategory =
              typeof subItem.category === 'string'
                ? null
                : (subItem.category as NewsCategory);

            if (subCategory?.slug) {
              groupLink.items!.push({
                label: subCategory.title,
                href: `/${subCategory.slug}`,
                slug: subCategory.slug,
              });
              slugSet.add(subCategory.slug);
            }
          }
        }

        headerGroups.push(groupLink);
      }
    }

    return {
      header: {
        categories: headerCategories,
        groups: headerGroups,
        ordered:
          headerParsed.ordered.length > 0
            ? headerParsed.ordered
            : [...headerCategories, ...headerGroups],
      },
      hamburger: {
        categories: hamburgerCategories,
        groups: hamburgerGroups,
        ordered:
          hamburgerParsed.ordered.length > 0
            ? hamburgerParsed.ordered
            : [...hamburgerCategories, ...hamburgerGroups],
      },
      categories: headerCategories,
      groups: headerGroups,
      allSlugs: Array.from(slugSet),
      tagSlugs: Array.from(tagSlugSet),
      staticHeaderDropdown,
      staticHamburgerDropdown,
    };
  } catch (err) {
    payload.logger.error({ err }, 'Failed to load nav config');
    return {
      header: { categories: [], groups: [], ordered: [] },
      hamburger: { categories: [], groups: [], ordered: [] },
      categories: [],
      groups: [],
      allSlugs: [],
      tagSlugs: [],
      staticHeaderDropdown: {
        label: 'Kubera Now',
        enabled: true,
      },
      staticHamburgerDropdown: {
        label: 'Kubera Now',
        enabled: true,
      },
    };
  }
});
