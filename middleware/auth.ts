import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Token de autenticación requerido' },
      { status: 401 }
    );
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user', JSON.stringify(decoded));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    '/api/inventory/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/dashboard/:path*',
  ],
}; 