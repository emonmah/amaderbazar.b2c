import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const rootDomain = process.env.ROOT_DOMAIN || 'platform.local';

  let tenantSlug = 'fashion-hub';
  let tenantId = 'tenant-fashion-001';

  // 1. Standalone Mode check
  if (process.env.TENANT_MODE === 'STANDALONE') {
    tenantId = process.env.DEFAULT_TENANT_ID || 'tenant-fashion-001';
  } else if (host.includes(rootDomain)) {
    // SaaS Subdomain extraction: [subdomain].[rootDomain]
    const subdomain = host.split(`.${rootDomain}`)[0].split(':')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      tenantSlug = subdomain;
      if (subdomain === 'techgear') {
        tenantId = 'tenant-tech-002';
      }
    }
  }

  // Clone headers and forward tenant metadata
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantId);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
