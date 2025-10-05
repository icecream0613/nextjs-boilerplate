// app/api/scraping-3/route.ts
import { NextResponse } from 'next/server';

// 상수 정의: 변경되지 않는 값
const BASE_URL = 'https://crawl-target-server.vercel.app';
const API_ENDPOINT = '/api/products';

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    // 변수 정의: 반복문에서 값이 변경되는 변수들
    // let 키워드로 선언하면 나중에 값을 변경할 수 있습니다
    const allProducts: any[] = [];  // 모든 상품을 저장할 배열 (상수로 선언)
    let currentPage = 1;           // 현재 처리 중인 페이지 번호 (변수)
    let hasMorePages = true;       // 더 많은 페이지가 있는지 확인하는 변수

    console.log(`카테고리 "${category}"의 모든 상품 수집 시작...`);

    // 반복문: 모든 페이지를 순차적으로 처리
    // while문은 조건이 참일 때까지 계속 반복합니다
    while (hasMorePages) {
      // 변수를 사용하여 동적 URL 생성
      const apiUrl = `${BASE_URL}${API_ENDPOINT}?page=${currentPage}&category=${category}&pageSize=10`;
      console.log(`페이지 ${currentPage} 처리 중...`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 현재 페이지의 상품들을 전체 목록에 추가
      if (data.products && data.products.length > 0) {
        allProducts.push(...data.products);
        console.log(`페이지 ${currentPage}: ${data.products.length}개 상품 추가`);

        // pagination 정보를 사용하여 다음 페이지 존재 여부 확인
        if (data.pagination.hasNextPage) {
          currentPage++; // 다음 페이지로 이동
        } else {
          hasMorePages = false;
          console.log(`페이지 ${currentPage}에서 ${data.products.length}개 상품 발견 - 마지막 페이지`);
        }
      } else {
        // 데이터가 없으면 반복문 종료
        hasMorePages = false;
        console.log(`페이지 ${currentPage}에서 데이터 없음 - 수집 완료`);
      }
    }

    // 모든 상품에 대해 처리
    const processedProducts = allProducts.map((product: any, index: number) => {
      console.log(`${index + 1}번째 상품:`, product.name, `₩${product.price.toLocaleString()}`);

      return {
        id: index + 1,
        name: product.name,
        price: product.price,
        formattedPrice: `₩${product.price.toLocaleString()}`,
        category: product.category,
        rating: product.rating
      };
    });

    console.log(`총 ${processedProducts.length}개 상품 수집 완료`);

    return NextResponse.json({
      success: true,
      data: processedProducts,
      total: processedProducts.length,
      category: category,
      pagesProcessed: currentPage
    });

  } catch (error) {
    console.error('API 호출 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '데이터를 가져오는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}