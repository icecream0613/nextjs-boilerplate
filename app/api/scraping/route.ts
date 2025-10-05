// app/api/scraping/route.ts
// Next.js에서 제공하는 서버 관련 기능들을 가져옵니다
import { NextRequest, NextResponse } from 'next/server';

// GET 요청을 처리하는 함수를 정의합니다
export async function GET() {
  // 외부 서버에서 데이터를 가져오는 작업을 시작합니다
  // fetch는 웹에서 데이터를 가져오는 기본 방법입니다
  const response = await fetch('https://crawl-target-server.vercel.app/api/products?category=living&page=1&pageSize=3');

  // 서버에서 받은 데이터를 JSON 형태로 변환합니다
  const data = await response.json();

  // 성공적으로 데이터를 가져왔을 때의 응답을 만듭니다
  return NextResponse.json({
    success: true,  // 성공 여부를 알려주는 플래그
    data: {
      response: data,                   // 서버에서 받은 응답 데이터
      category: 'living',              // 선택된 카테고리
      page: 1,                         // 현재 페이지
      pageSize: 3                      // 페이지 크기
    }
  });
}