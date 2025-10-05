// app/api/scraping-2/route.ts (개선된 버전)
import { NextResponse } from 'next/server';

// 상수 정의: 변경되지 않는 값
const BASE_URL = 'https://crawl-target-server.vercel.app';
const API_ENDPOINT = '/api/products';

export async function GET(request: Request) {
  // 변수 정의: 변경될 수 있는 값
  let pageNumber = 1;
  let category = 'living';
  let pageSize = 3;
  let productCount = 0;

  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const categoryParam = searchParams.get('category');
    const pageSizeParam = searchParams.get('pageSize');

    // 변수 값 설정 (사용자 입력에 따라 변경됨)
    if (pageParam) {
      pageNumber = parseInt(pageParam);
    }
    if (categoryParam) {
      category = categoryParam;
    }
    if (pageSizeParam) {
      pageSize = parseInt(pageSizeParam);
    }

    // 상수와 변수를 조합하여 API URL 생성
    const apiUrl = `${BASE_URL}${API_ENDPOINT}?category=${category}&page=${pageNumber}&pageSize=${pageSize}`;

    console.log(`페이지 ${pageNumber}, 카테고리 ${category}, 크기 ${pageSize} 스크래핑 중...`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 변수 값 변경
    productCount = data ? data.length : 0;

    console.log(`페이지 ${pageNumber}에서 ${productCount}개 상품 발견`);

    return NextResponse.json({
      success: true,
      data: {
        pageNumber: pageNumber,
        category: category,
        pageSize: pageSize,
        productCount: productCount,
        products: data || [] // 상품 목록
      }
    });

  } catch (error) {
    console.error('페이지 스크래핑 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '데이터를 가져오는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}