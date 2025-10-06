// app/api/files/csv/complete/route.ts
import { NextResponse } from 'next/server';
import { fetchProductData } from '@/lib/scraping-utils';
import { cleanProductData, validateProduct, removeDuplicates } from '@/lib/data-utils';
import { Product } from '@/lib/types/product';
import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const maxPages = parseInt(searchParams.get('maxPages') || '50');

    console.log(`스크래핑 시작: 카테고리=${category}, 페이지크기=${pageSize}, 최대페이지=${maxPages}`);

    // 1단계: 스크래핑으로 원시 데이터 수집
    const rawProducts: Product[] = await fetchProductData(category, pageSize, maxPages);
    console.log(`원시 데이터 수집 완료: ${rawProducts.length}개`);

    // 2단계: 데이터 정제
    const cleanedProducts: Product[] = rawProducts.map(product => cleanProductData(product));
    console.log(`데이터 정제 완료: ${cleanedProducts.length}개`);

    // 3단계: 유효성 검사 및 필터링
    const validProducts: Product[] = cleanedProducts.filter(product => {
      const validation = validateProduct(product);
      if (!validation.isValid) {
        console.log(`유효하지 않은 상품 제외: ${product.name} - ${validation.errors.join(', ')}`);
      }
      return validation.isValid;
    });
    console.log(`유효성 검사 완료: ${validProducts.length}개`);

    // 4단계: 중복 제거
    const uniqueProducts: Product[] = removeDuplicates(validProducts);
    console.log(`중복 제거 완료: ${uniqueProducts.length}개`);

    // 5단계: CSV 파일 저장
    const fileName = `products_${category}_${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = join(process.cwd(), fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: '상품ID' },
        { id: 'name', title: '상품명' },
        { id: 'price', title: '가격' },
        { id: 'originalPrice', title: '원가' },
        { id: 'category', title: '카테고리' },
        { id: 'rating', title: '평점' },
        { id: 'reviewCount', title: '리뷰수' },
        { id: 'specialOffer', title: '특가여부' },
        { id: 'sellerName', title: '판매자' },
        { id: 'sellerEmail', title: '판매자이메일' },
        { id: 'collectedAt', title: '수집시간' }
      ],
      encoding: 'utf8'
    });

    await csvWriter.writeRecords(uniqueProducts);
    console.log(`CSV 저장 완료: ${fileName}`);

    return NextResponse.json({
      success: true,
      message: '완전한 스크래핑 및 CSV 저장 완료!',
      data: {
        fileName: fileName,
        filePath: filePath,
        totalProducts: uniqueProducts.length,
        category: category,
        processingSteps: {
          rawData: rawProducts.length,
          cleanedData: cleanedProducts.length,
          validData: validProducts.length,
          finalData: uniqueProducts.length
        }
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('완전한 스크래핑 오류:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: '완전한 스크래핑 실패',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}