import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el método de la petición
  const method = request.method;

  // Configurar headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Manejar preflight requests
  if (method === 'OPTIONS') {
    return NextResponse.json({}, { headers });
  }

  // Continuar con la petición
  const response = NextResponse.next();
  
  // Agregar headers CORS a todas las respuestas
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: '/api/:path*',
}; 