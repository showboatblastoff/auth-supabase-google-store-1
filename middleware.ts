import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Request path: ${request.nextUrl.pathname}`);
  
  // Log all cookies for debugging
  console.log('[Middleware] Cookies:', Array.from(request.cookies.getAll())
    .map(c => `${c.name}=${c.value.substring(0, 5)}...`)
    .join(', '));
  
  let supabaseResponse = NextResponse.next({
    request,
  });

  console.log('[Middleware] Creating Supabase server client');
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          console.log('[Middleware] getAll cookies called');
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          console.log('[Middleware] setAll cookies called with', cookiesToSet.length, 'cookies');
          cookiesToSet.forEach(({ name, value }) => {
            console.log(`[Middleware] Setting cookie ${name}=${value.substring(0, 5)}...`);
            request.cookies.set(name, value);
          });
          
          supabaseResponse = NextResponse.next({
            request,
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`[Middleware] Setting cookie in response ${name}=${value.substring(0, 5)}...`);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This is essential - it refreshes the session and must be called
  // before checking the user
  console.log('[Middleware] Getting Supabase session');
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('[Middleware] Session error:', sessionError);
  }
  
  if (session) {
    console.log(`[Middleware] User is authenticated: ${session.user.email}`);
  } else {
    console.log('[Middleware] No active session found');
  }

  // Add CSP header
  const requestHeaders = new Headers(request.headers);
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleusercontent.com https://*.youtube.com https://*.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.googleusercontent.com https://*.google.com https://*.gstatic.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://accounts.google.com;
    connect-src 'self' https://*.googleapis.com https://*.google.com;
  `.replace(/\s+/g, ' ').trim();
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Create a new response with the CSP headers
  supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Check for Supabase auth cookie specifically
  const hasAuthCookie = request.cookies.has('sb-auth-token') || 
                        request.cookies.has('sb-refresh-token') || 
                        request.cookies.has('sb-access-token');
  
  console.log('[Middleware] Has Supabase auth cookies:', hasAuthCookie);

  // Protect routes that require authentication
  const protectedRoutes = ['/drive'];
  const publicRoutes = ['/login', '/auth', '/api/auth'];

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  console.log(`[Middleware] Route type: ${isProtectedRoute ? 'protected' : isPublicRoute ? 'public' : 'other'}`);

  // If it's a protected route and there's no session, redirect to login
  if (isProtectedRoute && !session) {
    console.log('[Middleware] Redirecting unauthenticated user to login');
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If it's a public route (like login) and user is already logged in,
  // redirect to home page
  if (isPublicRoute && session && request.nextUrl.pathname === '/login') {
    console.log('[Middleware] Redirecting authenticated user from login to home page');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Transfer cookies from supabaseResponse to the final response
  const cookieNames = Array.from(supabaseResponse.cookies.getAll()).map(c => c.name);
  console.log('[Middleware] Final response has cookies:', cookieNames.join(', '));

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 