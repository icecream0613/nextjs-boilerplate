// app/api/scraping-error-handling/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('스크래핑 시작...');

    // 의도적으로 잘못된 URL로 네트워크 에러 발생
    const response = await fetch('https://invalid-domain-that-does-not-exist.com/api/test');
    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error: unknown) {
    console.log('네트워크 오류 발생:', error instanceof Error ? error.message : '알 수 없는 오류');

    // 예외 처리로 프로그램이 중단되지 않고 적절한 응답 반환
    return NextResponse.json({
      success: false,
      error: '네트워크 연결 오류',
      message: 'API 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      handled: true,
      timestamp: new Date().toISOString()
    });
  }
}