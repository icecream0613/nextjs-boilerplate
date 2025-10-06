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

// 데이터베이스 저장용 인터페이스 (새로 추가)
export interface ProductDB {
  id?: number; // 레코드 고유 ID (자동 증가, 선택사항)
  product_id: string; // 상품 고유 ID (예: "PROD001", "PROD002")
  name: string; // 상품명
  price: number; // 현재 가격
  original_price: number; // 원래 가격
  category: string; // 카테고리
  description?: string; // 설명 (선택사항)
  rating: number; // 평점
  review_count: number; // 리뷰 개수
  special_offer: string; // 특가 여부
  seller_name: string; // 판매자 이름
  seller_email: string; // 판매자 이메일
  collected_at?: string; // 데이터 수집 시간
  created_at?: string; // 레코드 생성 시간
  updated_at?: string; // 레코드 수정 시간
}

// 변환 함수들
export function productToDB(product: Product): ProductDB {
  return {
    product_id: product.id, // "1" -> "1" (그대로 유지)
    name: product.name,
    price: product.price,
    original_price: product.originalPrice,
    category: product.category,
    rating: product.rating,
    review_count: product.reviewCount,
    special_offer: typeof product.specialOffer === 'boolean' 
      ? (product.specialOffer ? 'Y' : 'N') 
      : product.specialOffer.toString(),
    seller_name: product.sellerName,
    seller_email: product.sellerEmail,
    collected_at: product.collectedAt || new Date().toISOString()
  };
}

export function dbToProduct(dbProduct: ProductDB): Product {
  return {
    id: dbProduct.product_id, // "1" -> "1" (그대로 유지)
    name: dbProduct.name,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    category: dbProduct.category,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    specialOffer: dbProduct.special_offer === 'Y' ? true : dbProduct.special_offer === 'N' ? false : dbProduct.special_offer,
    sellerName: dbProduct.seller_name,
    sellerEmail: dbProduct.seller_email,
    collectedAt: dbProduct.collected_at
  };
}
