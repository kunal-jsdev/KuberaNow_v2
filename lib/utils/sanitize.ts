export function sanitize(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim();
}
