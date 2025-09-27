// app/api/scraping/route.ts
// Next.js에서 제공하는 서버 관련 기능들을 가져옵니다
import { NextRequest, NextResponse } from 'next/server';

// GET 요청을 처리하는 함수를 정의합니다
export async function GET() {
  try {
    // 외부 서버에서 데이터를 가져오는 작업을 시작합니다
    // fetch는 웹에서 데이터를 가져오는 기본 방법입니다
    const response = await fetch('https://crawl-target-server.vercel.app/api/products');

    // 서버에서 정상적인 응답을 받았는지 확인합니다
    if (!response.ok) {
      // 오류가 발생하면 에러를 던집니다
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 서버에서 받은 데이터를 JSON 형태로 변환합니다
    const products = await response.json();

    // 여러 상품 중에서 첫 번째 상품만 선택합니다
    const firstProduct = products[0];

    // 성공적으로 데이터를 가져왔을 때의 응답을 만듭니다
    return NextResponse.json({
      success: true,  // 성공 여부를 알려주는 플래그
      data: {
        name: firstProduct.name,        // 상품 이름
        price: firstProduct.price,      // 상품 가격
        category: firstProduct.category // 상품 카테고리
      }
    });

  } catch (error) {
    // 오류가 발생했을 때 실행되는 부분입니다
    console.error('스크래핑 오류:', error);

    // 오류 상황을 클라이언트에게 알려주는 응답을 만듭니다
    return NextResponse.json(
      { 
        success: false,  // 실패를 알려주는 플래그
        error: '데이터를 가져오는 중 오류가 발생했습니다.' 
      },
      { status: 500 }  // 서버 오류를 나타내는 상태 코드
    );
  }
}