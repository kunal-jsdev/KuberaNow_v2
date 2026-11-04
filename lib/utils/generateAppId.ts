import { randomUUID } from 'crypto';

export function generateAppId(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `APP-${yyyy}${mm}${dd}-${rand}`;
}
