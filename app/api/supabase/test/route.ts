// app/api/supabase/test/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    // test_table에서 데이터 조회하여 연결 테스트
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase 연결 오류:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        message: 'Supabase 연결에 실패했습니다.' 
      }, { status: 500 });
    }

    console.log('Supabase 연결 성공! 테스트 데이터 조회 완료.');
    return NextResponse.json({ 
      success: true, 
      data, 
      count: data.length,
      message: 'Supabase 연결 및 데이터 조회 성공!' 
    });

  } catch (error: unknown) {
    console.error('API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      message: '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}