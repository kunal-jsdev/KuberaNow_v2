export const TAG_TITLE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]*$/;

export const TAG_TITLE_RULE =
  'can only contain alphabets, numbers, spaces and hyphens (-). No special characters.';

export const isValidTagTitle = (title: string): boolean =>
  TAG_TITLE_PATTERN.test(title.trim());
