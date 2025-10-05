// app/api/scraping-categorize/route.ts
import { NextResponse } from 'next/server';

// TypeScript 인터페이스 정의 (2.2.9에서 학습한 내용 적용)
interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  specialOffer: string;  // 새로 추가된 필드
}

// API 응답 데이터의 구조를 정의 (2.2.9에서 학습한 내용 적용)
interface ApiResponse {
  products: Product[];   // 상품 목록
  pagination: {         // 페이지네이션 정보
    hasNextPage: boolean; // 다음 페이지 존재 여부
  };
}

interface CategorizedData {
  scrapedAt: string;
  category: string;
  totalProducts: number;
  priceCategories: {
    budget: Product[];      // 5만원 미만
    midRange: Product[];   // 5만원~20만원
    premium: Product[];    // 20만원 이상
  };
  specialOffers: Product[];  // 특별 할인 상품
  topRated: Product[];       // 평점 4.5 이상
}

// 상수 정의 (기존과 동일)
const BASE_URL = 'https://crawl-target-server.vercel.app';
const API_ENDPOINT = '/api/products';

// 기존 함수들 (2.2.9에서 정의한 함수들을 그대로 활용)
async function fetchPageData(page: number, category: string): Promise<ApiResponse> {
  const apiUrl = `${BASE_URL}${API_ENDPOINT}?page=${page}&category=${category}&pageSize=10`;
  console.log(`페이지 ${page} 데이터 가져오는 중...`);

  const response = await fetch(apiUrl);
  const data: ApiResponse = await response.json();

  return data;
}

function extractProductData(rawProducts: Product[]): Product[] {
  return rawProducts.map((product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount,
    specialOffer: product.specialOffer  // 새로 추가된 필드
  }));
}

// 새로 추가된 함수: 조건문을 사용하여 상품을 분류하는 함수
function categorizeProducts(products: Product[]): CategorizedData {
  const budget: Product[] = [];      // 5만원 미만
  const midRange: Product[] = [];    // 5만원~20만원
  const premium: Product[] = [];     // 20만원 이상
  const specialOffers: Product[] = []; // 특별 할인 상품
  const topRated: Product[] = [];    // 평점 4.5 이상

  // 각 상품을 조건에 따라 분류
  products.forEach(product => {
    // 가격대별 분류 (조건문 사용)
    if (product.price < 50000) {
      budget.push(product);
      console.log(`예산 상품: ${product.name} - ₩${product.price.toLocaleString()}`);
    } else if (product.price <= 200000) {
      midRange.push(product);
      console.log(`중간가 상품: ${product.name} - ₩${product.price.toLocaleString()}`);
    } else {
      premium.push(product);
      console.log(`프리미엄 상품: ${product.name} - ₩${product.price.toLocaleString()}`);
    }

    // 특별 할인 상품 분류 (조건문 사용)
    if (product.specialOffer === 'Y') {
      specialOffers.push(product);
      console.log(`특별 할인: ${product.name} - ₩${product.price.toLocaleString()}`);
    }

    // 고평점 상품 분류 (조건문 사용)
    if (product.rating >= 4.5) {
      topRated.push(product);
      console.log(`고평점 상품: ${product.name} - 평점 ${product.rating}`);
    }
  });

  return {
    scrapedAt: new Date().toISOString(),
    category: 'all',
    totalProducts: products.length,
    priceCategories: {
      budget,
      midRange,
      premium
    },
    specialOffers,
    topRated
  };
}

export async function GET(request: Request) {
  // URL에서 쿼리 파라미터 가져오기
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';

  // 변수 정의: 반복문에서 값이 변경되는 변수들 (2.2.9와 동일한 구조)
  const allProducts: Product[] = [];  // 추출된 상품들을 저장할 배열
  let currentPage = 1;               // 현재 처리 중인 페이지 번호
  let hasMorePages = true;           // 더 많은 페이지가 있는지 확인하는 변수

  console.log(`카테고리 "${category}"의 상품 데이터 분류 시작...`);

  // 반복문: 모든 페이지를 순차적으로 처리 (2.2.9의 구조 활용)
  while (hasMorePages) {
    // 함수를 사용하여 페이지 데이터 가져오기
    const pageData = await fetchPageData(currentPage, category);

    // 현재 페이지의 상품들을 처리
    if (pageData.products && pageData.products.length > 0) {
      // 함수를 사용하여 상품 데이터 추출
      const extractedProducts = extractProductData(pageData.products);

      // 추출된 상품들을 전체 목록에 추가
      allProducts.push(...extractedProducts);
      console.log(`페이지 ${currentPage}: ${extractedProducts.length}개 상품 추출 완료`);

      // pagination 정보를 사용하여 다음 페이지 존재 여부 확인
      if (pageData.pagination.hasNextPage) {
        currentPage++; // 다음 페이지로 이동
      } else {
        hasMorePages = false;  // 더 이상 페이지가 없으므로 반복문 종료
        console.log(`페이지 ${currentPage}에서 ${extractedProducts.length}개 상품 발견 - 마지막 페이지`);
      }
    } else {
      // 데이터가 없으면 반복문 종료
      hasMorePages = false;
      console.log(`페이지 ${currentPage}에서 데이터 없음 - 추출 완료`);
    }
  }

  // 조건문을 사용하여 상품 분류 (새로 추가된 기능)
  const categorizedData = categorizeProducts(allProducts);

  console.log(`총 ${allProducts.length}개 상품 분류 완료`);
  console.log(`예산 상품: ${categorizedData.priceCategories.budget.length}개`);
  console.log(`중간가 상품: ${categorizedData.priceCategories.midRange.length}개`);
  console.log(`프리미엄 상품: ${categorizedData.priceCategories.premium.length}개`);
  console.log(`특별 할인 상품: ${categorizedData.specialOffers.length}개`);
  console.log(`고평점 상품: ${categorizedData.topRated.length}개`);

  // 클라이언트에게 응답 데이터 전송
  return NextResponse.json({
    success: true,  // 성공 여부를 알려주는 플래그
    data: categorizedData
  });
}