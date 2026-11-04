import type { TextFieldSingleValidation } from 'payload';

export type UnicodeSlugifyArgs = {
  data?: any;

  req?: any;

  valueToSlugify?: any;
};

export const cleanSlugString = (value: string): string => {
  if (typeof value !== 'string') return '';

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  const result = decoded
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['(),;:!?$%#&"./\[\]{}]/g, '') // Rule 3: Clean symbols
    .replace(/\s+/g, '-') // Rule 4: Replace spaces with -
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, '') // Remove other non-alphanumeric chars just in case, while keeping -
    .replace(/-+/g, '-') // Rule 4: Change -- to -
    .replace(/^-+|-+$/g, ''); // Rule 4: Remove starting/ending hyphens

  return result;
};

export const unicodeSlugify = (
  args: string | UnicodeSlugifyArgs
): string | undefined => {
  const valueToSlugify = typeof args === 'string' ? args : args?.valueToSlugify;
  if (typeof valueToSlugify !== 'string') return undefined;

  return cleanSlugString(valueToSlugify) || undefined;
};

export const validateSlug = (
  originalValidate?: TextFieldSingleValidation
): TextFieldSingleValidation => {
  return async (value, options) => {
    if (originalValidate) {
      const originalResult =
        typeof originalValidate === 'function'
          ? await originalValidate(value, options)
          : true;
      if (originalResult !== true && typeof originalResult === 'string') {
        return originalResult;
      }
    }

    if (typeof value !== 'string' || value.trim() === '') {
      const status = (options?.data as { _status?: string } | undefined)
        ?._status;
      if (options?.required && status !== 'draft') {
        return 'Slug is required to publish the article.';
      }
      return true;
    }

    const trimmedValue = value.trim();

    if (/\s/.test(trimmedValue)) {
      return 'Slug cannot contain white space.';
    }

    if (/%[0-9A-Fa-f]{2}/.test(trimmedValue)) {
      return 'Slug must not be URL-encoded (e.g., %20).';
    }

    // Note: Removed word and character count limits here
    // so that it no longer blocks the user from publishing.
    // (Payload CMS validation errors are strictly blocking).

    return true;
  };
};
