import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string;
    const pathname = request.nextUrl.pathname;

    // Role-based path protection
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/opd/inbox', request.url));
    }

    if (pathname.startsWith('/opd') && role !== 'OPD') {
      return NextResponse.redirect(new URL('/admin/chat', request.url));
    }

    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*', '/opd/:path*'],
}
