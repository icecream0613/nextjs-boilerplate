// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 보호할 API 경로들
  const protectedPaths = ['/api/supabase', '/api/elasticsearch', '/api/files'];

  // 현재 요청 경로가 보호 대상인지 확인
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // URL 파라미터에서 API 키 확인
    const apiKey = request.nextUrl.searchParams.get('apikey');

    // 환경 변수에서 설정된 API 키와 비교
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/supabase/:path*',
    '/api/elasticsearch/:path*',
    '/api/files/:path*'
  ]
};