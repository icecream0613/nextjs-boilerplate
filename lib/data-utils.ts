// lib/data-utils.ts
import { Product } from '@/lib/types/product';

// 1. 데이터 정제 함수
export function cleanProductData(rawProduct: Product): Product {
    return {
        id: rawProduct.id,
        name: rawProduct.name.trim(),
        price: rawProduct.price,
        originalPrice: rawProduct.originalPrice,
        category: rawProduct.category.trim().toLowerCase(),
        rating: Math.max(0, Math.min(5, rawProduct.rating)),
        reviewCount: rawProduct.reviewCount,
        specialOffer: rawProduct.specialOffer === 'Y',
        sellerName: rawProduct.sellerName.trim(),
        sellerEmail: rawProduct.sellerEmail.trim().toLowerCase(),
        collectedAt: new Date().toISOString()
    };
}

// 2. 데이터 유효성 검사 함수
export function validateProduct(product: Product) {
    const errors = [];

    // 필수 필드 체크
    if (!product.name || product.name.length === 0) {
        errors.push('상품명이 없습니다');
    }

    // 가격 유효성 체크
    if (!product.price || product.price <= 0) {
        errors.push('올바르지 않은 가격입니다');
    }

    // 원가가 정가보다 높은 경우 체크
    if (product.originalPrice && product.price && product.originalPrice < product.price) {
        errors.push('원가가 정가보다 낮습니다');
    }

    // 평점 범위 체크
    if (product.rating && (product.rating < 0 || product.rating > 5)) {
        errors.push('평점은 0-5 사이여야 합니다');
    }

    // 리뷰 수 체크
    if (product.reviewCount && product.reviewCount < 0) {
        errors.push('리뷰 수는 음수가 될 수 없습니다');
    }

    // 판매자 이메일 형식 체크
    if (product.sellerEmail && !product.sellerEmail.includes('@')) {
        errors.push('올바르지 않은 판매자 이메일 형식입니다');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 3. 중복 데이터 제거 함수
export function removeDuplicates(products: Product[]): Product[] {
    const uniqueProducts: Product[] = [];
    const seen = new Set<string>();

    for (const product of products) {
        // 상품 ID로 고유성 판단
        if (!seen.has(product.id)) {
            seen.add(product.id);
            uniqueProducts.push(product);
        }
    }

    console.log(`중복 제거: ${products.length} → ${uniqueProducts.length}`);
    return uniqueProducts;
}