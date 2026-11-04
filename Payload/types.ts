import type { NewsCardItem } from '@/Payload/lib/utilities/getNewsByCategory';
import type { NewsCategory } from '@/payload-types';

/**
 * A news category reduced to what the navbar dropdown and the category page
 * tabs actually render.
 */
export type CategoryOption = Pick<NewsCategory, 'title' | 'slug'> & {
  id?: string;
};

export type DropdownItem = {
  label: string;
  href: string;
};

export type DropdownProps = {
  label: string;
  items: readonly DropdownItem[];
  className?: string;
  previewNews?: Record<string, NewsCardItem[]>;
  showNew?: boolean;
};

export type ContactItem = {
  type: 'email' | 'whatsapp' | 'contact';
  value: string;
};

export type ContactInfoBoxProps = {
  contacts: readonly ContactItem[];
  compact?: boolean;
};
