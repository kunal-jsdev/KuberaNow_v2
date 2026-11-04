import { SOCIAL_LINKS } from './navigation';

export const HOME_TITLE =
  'KuberaNow – Gujarat Business News, Market & Financial Updates KuberaNow';

export const HOME_DESCRIPTION =
  'KuberaNow brings Gujarat-focused business news, market updates, financial insights, economy, investment and global business coverage for investors and entrepreneurs.';

export const HOME_KEYWORDS = [
  'business news Gujarat',
  'Gujarati business news',
  'Gujarat business news',
  'financial news India',
  'market news',
  'business updates',
];

export const HOME_H1 = 'Gujarat Business News';

const HOME_SAME_AS_NAMES = [
  'Instagram',
  'Facebook',
  'X',
  'YouTube',
  'LinkedIn',
];

export const HOME_SAME_AS = SOCIAL_LINKS.filter((social) =>
  HOME_SAME_AS_NAMES.includes(social.name)
).map((social) => social.href);
