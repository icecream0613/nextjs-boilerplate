// app/api/scraping/puppeteer/route.ts
import { NextResponse } from 'next/server';
import puppeteer, { Browser, Page } from 'puppeteer';

// 타입 정의
interface ScrapedProduct {
  name: string;
  price: string;
  image?: string;
}

interface PuppeteerResult {
  products: ScrapedProduct[];
  metadata: {
    totalFound: number;
    scrapingTime: number;
    url: string;
  };
}

async function scrapeWithPuppeteer(): Promise<PuppeteerResult> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('Puppeteer 브라우저 실행 중...');

    // 브라우저 실행 (헤드리스 모드)
    browser = await puppeteer.launch({ 
      headless: true, // 서버에서는 헤드리스 모드 사용
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    page = await browser.newPage();

    // 브라우저 설정
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    console.log('페이지 로딩 중...');
    await page.goto('https://crawl-target-server.vercel.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // 페이지가 완전히 로드될 때까지 대기
    console.log('콘텐츠 로딩 대기 중...');
    await page.waitForSelector('h3', { timeout: 15000 });

    // 추가 대기 (동적 콘텐츠 완전 로딩)
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('상품 정보 추출 중...');

    // 상품 데이터 추출
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('main > section');
      const productList: ScrapedProduct[] = [];

      productElements.forEach(section => {
        const productCards = section.querySelectorAll('div[class*="grid"] > div');

        productCards.forEach(card => {
          const nameElement = card.querySelector('h3');
          const priceElement = card.querySelector('span[class*="text-xl"]');
          const imageElement = card.querySelector('img');

          if (nameElement && priceElement) {
            productList.push({
              name: nameElement.textContent?.trim() || '',
              price: priceElement.textContent?.trim() || '',
              image: imageElement?.src || ''
            });
          }
        });
      });

      return productList;
    });

    const endTime = Date.now();
    const scrapingTime = endTime - startTime;

    console.log('Puppeteer 스크래핑 완료');
    console.log(`총 ${products.length}개 상품 발견`);
    console.log(`소요 시간: ${scrapingTime}ms`);

    return {
      products,
      metadata: {
        totalFound: products.length,
        scrapingTime,
        url: 'https://crawl-target-server.vercel.app'
      }
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('Puppeteer 스크래핑 오류:', errorMessage);
    throw new Error(`Puppeteer 실행 실패: ${errorMessage}`);
  } finally {
    // 리소스 정리
    try {
      if (page) await page.close();
      if (browser) await browser.close();
      console.log('브라우저 리소스 정리 완료');
    } catch (cleanupError: unknown) {
      const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : '알 수 없는 오류';
      console.error('리소스 정리 중 오류:', cleanupMessage);
    }
  }
}

export async function GET() {
  try {
    const result = await scrapeWithPuppeteer();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Puppeteer 스크래핑 성공'
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('API 라우트 오류:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Puppeteer 스크래핑 실패',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}