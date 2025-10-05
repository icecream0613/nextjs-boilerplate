// lib/types/product.ts

// 타입 정의 - 상품 데이터의 구조를 정의합니다
export interface Product {
  id: string; // 상품 고유 ID (예: "1", "2", "3")
  name: string; // 상품명 (예: "스마트 워치 S2")
  price: number; // 현재 가격 (예: 220000)
  originalPrice: number; // 원래 가격 (예: 199000)
  category: string; // 카테고리 (예: "digital", "fashion")
  rating: number; // 평점 (0-5 사이의 숫자)
  reviewCount: number; // 리뷰 개수
  specialOffer: string | boolean; // 특가 여부 (string 또는 boolean만 허용, 원시 데이터: "Y"/"N", 정제 후: true/false)
  sellerName: string; // 판매자 이름
  sellerEmail: string; // 판매자 이메일
  collectedAt?: string; // 데이터 수집 시간 (정제 과정에서 추가됨, ?는 선택사항)
}

export interface ApiResponse {
  products: Product[];
  pagination: {
    hasNextPage: boolean;
  };
}

export interface ScrapingConfig {
  baseUrl: string;
  timeout: number;
  userAgent: string;
}
