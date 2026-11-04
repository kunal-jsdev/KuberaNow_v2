import { ReactNode } from 'react';

import type { NewsCategory } from '@/payload-types';

export type CategoryOption = Pick<NewsCategory, 'id' | 'title' | 'slug'>;

export type DropdownItem = { label: string; href: string };
export interface DropdownProps {
  label: string;
  items: DropdownItem[];
  className?: string;
  activeClassName?: string;
}
export type ContactItem = {
  type: 'email' | 'whatsapp' | 'contact';
  value: string;
};
export type ContactInfoBoxProps = {
  contacts: ContactItem[];
  compact?: boolean;
};
export type ContactDepartmentCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  contacts: { type: 'email' | 'whatsapp'; value: string }[];
  footnote: string;
  layout?: 'split' | 'stacked';
};
