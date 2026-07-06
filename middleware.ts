import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/change-password', '/api/auth/login', '/api/auth/logout']
const COOKIE_NAME = 'haya_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const response = NextResponse.next()
    if (pathname.startsWith('/login')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    }
    return response
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/logo') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  }

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
