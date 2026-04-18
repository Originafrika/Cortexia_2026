// Neon Auth Middleware
// Validates JWT tokens from Neon Auth service
// Based on: https://ep-cool-meadow-an2f2vge.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const NEON_AUTH_JWKS_URL = process.env.NEON_AUTH_JWKS_URL || 
  'https://ep-cool-meadow-an2f2vge.neonauth.c-6.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.j';

const JWKS = createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));

export interface AuthContext {
  userId: string;
  email?: string;
  organizationId?: string;
  roles: string[];
}

/**
 * Verify Neon Auth JWT token
 */
async function verifyToken(token: string): Promise<AuthContext | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: ['RS256'],
    });

    return {
      userId: payload.sub as string,
      email: payload.email as string,
      organizationId: payload.organization_id as string,
      roles: (payload.roles as string[]) || [],
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Middleware for Neon Auth
 * Protects API routes and pages
 */
export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
    '/static',
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : request.cookies.get('neon-auth-token')?.value;

  if (!token) {
    // For API routes, return 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const authContext = await verifyToken(token);

  if (!authContext) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add auth context to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', authContext.userId);
  requestHeaders.set('x-user-email', authContext.email || '');
  requestHeaders.set('x-organization-id', authContext.organizationId || '');
  requestHeaders.set('x-user-roles', JSON.stringify(authContext.roles));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware config
 */
export const config = {
  matcher: [
    // Skip static files and public paths
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Helper to get auth context from request headers (server-side)
 */
export function getAuthContextFromHeaders(headers: Headers): AuthContext | null {
  const userId = headers.get('x-user-id');
  
  if (!userId) return null;

  return {
    userId,
    email: headers.get('x-user-email') || undefined,
    organizationId: headers.get('x-organization-id') || undefined,
    roles: JSON.parse(headers.get('x-user-roles') || '[]'),
  };
}
