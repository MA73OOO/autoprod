import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user }, error } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Route protection
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      // If not logged in, redirect to login page
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Role lives in Prisma DB — check via internal API route.
    // Fallback: allow known owner email so the admin is never locked out.
    let isAdmin = user.email === 'henaorangelmateo@gmail.com' || user.email === 'mateo@autoprod.io';

    if (!isAdmin) {
      try {
        const roleRes = await fetch(`${request.nextUrl.origin}/api/auth/me-role`, {
          headers: { cookie: request.headers.get('cookie') || '' },
        });
        if (roleRes.ok) {
          const { role } = await roleRes.json();
          isAdmin = role === 'ADMIN';
        }
      } catch {
        // If the fetch fails, deny access to be safe
      }
    }

    if (!isAdmin) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages
  if (url.pathname.startsWith('/login') && user) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
