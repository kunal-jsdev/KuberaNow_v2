import { type NextRequest, NextResponse } from 'next/server';

import { get301RedirectDestination } from './constants/redirects';
import { resolveRedirectResponse } from './lib/redirect';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/d36985ec/login', request.url));
  }

  const legacyRedirectTarget = get301RedirectDestination(pathname);
  if (legacyRedirectTarget) {
    return NextResponse.redirect(
      new URL(legacyRedirectTarget, request.url),
      301
    );
  }

  const redirectSetting =
    process.env.REDIRECT_TO_LINKTREE?.trim().toLowerCase();
  const linktreeUrl = process.env.LINKTREE_URL?.trim();

  if (redirectSetting === 'yes' && linktreeUrl) {
    const redirectStatus = Number(process.env.REDIRECT_STATUS);
    const status = Number.isInteger(redirectStatus) ? redirectStatus : 302;

    return NextResponse.redirect(new URL(linktreeUrl, request.url), status);
  }

  return resolveRedirectResponse(request);
}

export const config = {
  matcher: [
    '/((?!_next|favicon\.ico|robots\.txt|sitemap\.xml|manifest\.webmanifest|.*\..*$).*)',
  ],
};
