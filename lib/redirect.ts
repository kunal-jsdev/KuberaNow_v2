import { NextRequest, NextResponse } from 'next/server';

const TEST_ENV_VALUES = new Set(['yes']);
const DEFAULT_REDIRECT_STATUS = 302;
const VALID_REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

function normalizeEnvValue(value?: string): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized.toLowerCase() : null;
}

export function getAppEnvironment(): string {
  return (
    normalizeEnvValue(process.env.REDIRECT_TO_LINKTREE) ??
    normalizeEnvValue(process.env.NODE_ENV) ??
    'live'
  );
}

export function getRedirectUrl(): string | null {
  const redirectUrl = process.env.LINKTREE_URL?.trim();

  if (!redirectUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(redirectUrl);
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export function getRedirectStatus(): number {
  const rawValue = process.env.REDIRECT_STATUS?.trim();

  if (!rawValue) {
    return DEFAULT_REDIRECT_STATUS;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return VALID_REDIRECT_STATUS.has(parsedValue)
    ? parsedValue
    : DEFAULT_REDIRECT_STATUS;
}

function shouldBypassRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;

  return (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/llms.txt'
  );
}

export function resolveRedirectResponse(request: NextRequest) {
  const appEnvironment = getAppEnvironment();
  const redirectUrl = getRedirectUrl();

  if (
    !TEST_ENV_VALUES.has(appEnvironment) ||
    !redirectUrl ||
    shouldBypassRedirect(request)
  ) {
    return NextResponse.next();
  }

  const currentUrl = new URL(request.url);
  const targetUrl = new URL(redirectUrl);

  if (
    currentUrl.origin === targetUrl.origin &&
    currentUrl.pathname === targetUrl.pathname
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(redirectUrl, { status: getRedirectStatus() });
}
