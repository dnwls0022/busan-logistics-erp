import React, { useState } from 'react';

// 샘플 지점 데이터 (부산 지역 중심)
const branches = [
  { id: 1, name: '부산 본사 물류센터', address: '부산광역시 부산진구 중앙대로 708', status: '정상 운영', stock: '98%' },
  { id: 2, name: '해운대 센텀점', address: '부산광역시 해운대구 센텀중앙로 79', status: '정상 운영', stock: '85%' },
  { id: 3, name: '서면 1호점', address: '부산광역시 부산진구 서전로 37', status: '혼잡', stock: '42%' },
  { id: 4, name: '남포동 국제시장점', address: '부산광역시 중구 창선동 1가 12', status: '정상 운영', stock: '91%' },
  { id: 5, name: '동래 온천점', address: '부산광역시 동래구 중앙대로 1381', status: '점검 중', stock: '10%' },
];

export default function BranchMap() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  // 검색 필터링
  const filteredBranches = branches.filter(b => 
    b.name.includes(searchTerm) || b.address.includes(searchTerm)
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      
      {/* 상단 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '26px', color: '#2c1e1a', marginBottom: '8px' }}>
          🗺️ 지점 지도 보기 페이지
        </h2>
        <p style={{ color: '#795548', fontSize: '14px' }}>부산 지역 주요 지점의 실시간 위치와 물류 현황을 한눈에 확인할 수 있습니다.</p>
      </div>

      {/* 메인 레이아웃 (좌측: 지점 리스트 / 우측: 지도 및 상세 정보) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', height: '600px' }}>
        
        {/* 📋 좌측: 지점 검색 및 리스트 */}
        <div style={cardStyle}>
          <h4 style={{ fontSize: '15px', color: '#3e2723', marginBottom: '15px' }}>📍 지점 검색 및 목록</h4>
          
          {/* 검색창 */}
          <input 
            type="text" 
            placeholder="지점명 또는 주소 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          {/* 지점 스크롤 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', height: '440px', paddingRight: '5px' }}>
            {filteredBranches.map((branch) => {
              const isSelected = selectedBranch.id === branch.id;
              return (
                <div 
                  key={branch.id} 
                  onClick={() => setSelectedBranch(branch)}
                  style={{
                    backgroundColor: isSelected ? '#efebe9' : '#fff',
                    border: isSelected ? '1px solid #8d6e63' : '1px solid #d7ccc8',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#3e2723' }}>{branch.name}</strong>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      backgroundColor: branch.status === '정상 운영' ? '#e8f5e9' : branch.status === '혼잡' ? '#fff3e0' : '#ffebee',
                      color: branch.status === '정상 운영' ? '#2e7d32' : branch.status === '혼잡' ? '#ef6c00' : '#c62828',
                      fontWeight: 'bold'
                    }}>
                      {branch.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#795548', margin: 0 }}>{branch.address}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🗺️ 우측: 지도 영역 및 선택된 지점 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 지도 모사 시각화 박스 (실제 카카오/네이버맵 연동 시 이 자리에 지도 컴포넌트 삽입) */}
          <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#efe8e1', position: 'relative', overflow: 'hidden' }}>
            
            {/* 가상의 지도 배경 디자인 요소 */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#5d4037 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📌</div>
              <h3 style={{ fontSize: '20px', color: '#2c1e1a', margin: '0 0 5px 0' }}>{selectedBranch.name}</h3>
              <p style={{ fontSize: '13px', color: '#5d4037', margin: '0 0 15px 0' }}>{selectedBranch.address}</p>
              <span style={{ backgroundColor: '#5d4037', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                실시간 위치 마커 활성화됨
              </span>
            </div>
          </div>

          {/* 선택된 지점 상세 요약 패널 */}
          <div style={{ ...cardStyle, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#8d6e63', fontWeight: 'bold' }}>선택된 지점 재고 여유율</span>
                <h4 style={{ fontSize: '18px', color: '#3e2723', margin: '4px 0 0 0' }}>{selectedBranch.name} ({selectedBranch.stock})</h4>
              </div>
              <button style={actionButtonStyle}>
                📦 해당 지점 재고 상세 조회
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// 🎨 스타일 정의
const cardStyle: React.CSSProperties = {
  backgroundColor: '#fffdf9',
  borderRadius: '12px',
  border: '1px solid #d7ccc8',
  padding: '24px',
  boxShadow: '0 4px 12px rgba(44,30,26,0.05)',
  boxSizing: 'border-box',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d7ccc8',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  marginBottom: '15px',
};

const actionButtonStyle: React.CSSProperties = {
  backgroundColor: '#5d4037',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '13px',
};