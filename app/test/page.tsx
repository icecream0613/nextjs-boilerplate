'use client';  // 클라이언트 컴포넌트로 설정

import { useState } from 'react';  // 상태 관리를 위한 React 훅

export default function TestPage() {
  // API 호출 결과를 저장할 상태 변수
  const [result, setResult] = useState<any>(null);
  // 로딩 상태를 관리하는 변수
  const [loading, setLoading] = useState(false);

  // API 호출 함수
  const callAPI = async () => {
    setLoading(true);  // 로딩 시작

    try {
      // 우리가 만든 API 엔드포인트 호출
      const response = await fetch('/api/scraping');
      const data = await response.json();

      // 결과를 상태에 저장
      setResult(data);
    } catch (error) {
      // 오류 발생 시 에러 메시지 저장
      setResult({ success: false, error: 'API 호출 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);  // 로딩 종료
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>API 테스트 페이지</h1>

      {/* API 호출 버튼 */}
      <button 
        onClick={callAPI}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '로딩 중...' : 'API 호출하기'}
      </button>

      {/* 결과 표시 영역 */}
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>API 호출 결과:</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}