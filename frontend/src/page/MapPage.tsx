import React, { useState, useEffect } from 'react';
import './MapPage.css';

declare global {
  interface Window {
    kakao: any;
  }
}

// 실제 부산 인기 디저트 카페 10곳 (로드뷰 및 지도 데이터 완비)
const branches = [
  { id: 1, name: '전포 카페거리 희와제과', address: '부산광역시 부산진구 서전로37번길 27', status: '정상 운영', stock: '95%' },
  { id: 2, name: '광안리 초희', address: '부산광역시 수영구 광남로94번길 16', status: '정상 운영', stock: '88%' },
  { id: 3, name: '해운대 전포목걸이빵 랜드마크', address: '부산광역시 해운대구 우동1로 38', status: '혼잡', stock: '42%' },
  { id: 4, name: '남포동 깡통시장 르브레드랩', address: '부산광역시 중구 부평1길 39', status: '정상 운영', stock: '91%' },
  { id: 5, name: '동래 온천장 모모스커피', address: '부산광역시 동래구 시실로 23', status: '정상 운영', stock: '76%' },
  { id: 6, name: '전포동 베이커스', address: '부산광역시 부산진구 동천로 55', status: '혼잡', stock: '35%' },
  { id: 7, name: '송정리 빈스톡', address: '부산광역시 해운대구 송정해변로 50', status: '정상 운영', stock: '80%' },
  { id: 8, name: '영도 피아크 디저트카페', address: '부산광역시 영도구 해양로 195', status: '정상 운영', stock: '90%' },
  { id: 9, name: '서면 전포카페거리 로우앤스위트', address: '부산광역시 부산진구 동성로 25', status: '점검 중', stock: '15%' },
  { id: 10, name: '센텀시티 신세계백화점 삼진어묵/디저트관', address: '부산광역시 해운대구 센텀남대로 35', status: '정상 운영', stock: '98%' },
];

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  const filteredBranches = branches.filter(b => 
    b.name.includes(searchTerm) || b.address.includes(searchTerm)
  );

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById('kakao-map');
      const roadviewContainer = document.getElementById('kakao-roadview');
      
      if (!container || !roadviewContainer) return;

      const options = {
        center: new window.kakao.maps.LatLng(35.1796, 129.0756),
        level: 3
      };

      // 1. 지도 생성
      const map = new window.kakao.maps.Map(container, options);
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 2. 로드뷰 생성기 설정
      const roadview = new window.kakao.maps.Roadview(roadviewContainer);
      const roadviewClient = new window.kakao.maps.RoadviewClient();

      geocoder.addressSearch(selectedBranch.address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 지도 마커 표시
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:12px;font-weight:bold;text-align:center;color:#3e2723;background:#fff;border-radius:4px;">${selectedBranch.name}</div>`
          });
          infowindow.open(map, marker);

          map.setCenter(coords);

          // 3. 로드뷰 검색 반경 내에서 파노라마 ID 탐색 후 렌더링
          roadviewClient.getNearestPanoId(coords, 300, (panoId: any) => {
            if (panoId) {
              roadview.setPanoId(panoId, coords);
            }
          });

          setTimeout(() => {
            map.relayout();
            roadview.relayout();
            map.setCenter(coords);
          }, 150);
        }
      });
    });
  }, [selectedBranch]);

  return (
    <div className="map-page-container">
      
      <div className="map-header">
        <h2 className="map-title">🧁 부산 인기 디저트 카페 종합 관리 지도 및 로드뷰</h2>
        <p className="map-subtitle">부산 지역 유명 가맹점의 실시간 위치 지도와 주변 실제 거리(로드뷰)를 확인합니다.</p>
      </div>

      <div className="map-layout">
        
        {/* 좌측 리스트 */}
        <div className="card-box">
          <h4 className="section-title">📍 부산 인기 카페 검색 및 목록 ({branches.length}개 지점)</h4>
          
          <input 
            type="text" 
            placeholder="카페명 또는 주소 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="branch-list-scroll">
            {filteredBranches.map((branch) => {
              const isSelected = selectedBranch.id === branch.id;
              return (
                <div 
                  key={branch.id} 
                  onClick={() => setSelectedBranch(branch)}
                  className={`branch-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="branch-item-header">
                    <strong className="branch-name">{branch.name}</strong>
                    <span className={`branch-status ${branch.status === '정상 운영' ? 'normal' : branch.status === '혼잡' ? 'busy' : 'check'}`}>
                      {branch.status}
                    </span>
                  </div>
                  <p className="branch-address">{branch.address}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 지도 + 로드뷰 영역 */}
        <div className="map-right-section">
          
          {/* 지도 박스 */}
          <div className="card-box map-card-wrapper">
            <div id="kakao-map" className="kakao-map-container"></div>
          </div>

          {/* 로드뷰 박스 */}
          <div className="card-box map-card-wrapper">
            <div id="kakao-roadview" className="kakao-map-container"></div>
          </div>

          {/* 하단 정보 패널 */}
          <div className="card-box info-panel">
            <div className="info-panel-content">
              <div>
                <span className="info-label">선택된 카페 재고 여유율</span>
                <h4 className="info-value">{selectedBranch.name} ({selectedBranch.stock})</h4>
              </div>
              <button className="action-button">
                📦 해당 카페 재고 상세 조회
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}