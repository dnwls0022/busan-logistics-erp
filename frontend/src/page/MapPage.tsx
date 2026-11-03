import { useState, useEffect, useRef } from 'react';
import './MapPage.css';

declare global {
  interface Window {
    kakao: any;
  }
}

const initialBranches = [
  { id: 1, name: '전포 카페거리 희와제과', address: '부산광역시 부산진구 서전로37번길 27', status: '정상 운영', stockNum: 95, isCustom: false, isFavorite: false },
  { id: 2, name: '광안리 초희', address: '부산광역시 수영구 광남로94번길 16', status: '정상 운영', stockNum: 88, isCustom: false, isFavorite: false },
  { id: 3, name: '해운대 전포목걸이빵 랜드마크', address: '부산광역시 해운대구 우동1로 38', status: '혼잡', stockNum: 42, isCustom: false, isFavorite: false },
  { id: 4, name: '남포동 깡통시장 르브레드랩', address: '부산광역시 중구 부평1길 39', status: '정상 운영', stockNum: 91, isCustom: false, isFavorite: false },
  { id: 5, name: '동래 온천장 모모스커피', address: '부산광역시 동래구 시실로 23', status: '정상 운영', stockNum: 76, isCustom: false, isFavorite: false },
  { id: 6, name: '전포동 베이커스', address: '부산광역시 부산진구 동천로 55', status: '혼잡', stockNum: 35, isCustom: false, isFavorite: false },
  { id: 7, name: '송정리 빈스톡', address: '부산광역시 해운대구 송정해변로 50', status: '정상 운영', stockNum: 80, isCustom: false, isFavorite: false },
  { id: 8, name: '영도 피아크 디저트카페', address: '부산광역시 영도구 해양로 195', status: '정상 운영', stockNum: 90, isCustom: false, isFavorite: false },
  { id: 9, name: '서면 전포카페거리 로우앤스위트', address: '부산광역시 부산진구 동성로 25', status: '점검 중', stockNum: 15, isCustom: false, isFavorite: false },
  { id: 10, name: '센텀시티 신세계백화점 삼진어묵/디저트관', address: '부산광역시 해운대구 센텀남대로 35', status: '정상 운영', stockNum: 98, isCustom: false, isFavorite: false },
];

export default function MapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [branches, setBranches] = useState(initialBranches);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');

  const [isRoadviewFullscreen, setIsRoadviewFullscreen] = useState(false);
  const [showDeliveryRoute, setShowDeliveryRoute] = useState(false);

  const mapInstanceRef = useRef<any>(null);
  const roadviewInstanceRef = useRef<any>(null);
  const roadviewClientRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const alertBranches = branches.filter(b => b.status === '혼잡' || b.status === '점검 중');

  const filteredBranches = branches.filter(b => {
    const matchesSearch = b.name.includes(searchTerm) || b.address.includes(searchTerm);
    const matchesStatus = statusFilter === '전체' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
    if (a.isCustom !== b.isCustom) return b.isCustom ? 1 : -1;
    return 0;
  });

  const handleCycleStatus = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setBranches(prev => prev.map(b => {
      if (b.id === id) {
        let nextStatus = '정상 운영';
        if (b.status === '정상 운영') nextStatus = '혼잡';
        else if (b.status === '혼잡') nextStatus = '점검 중';
        else if (b.status === '점검 중') nextStatus = '정상 운영';

        const updated = { ...b, status: nextStatus };
        if (selectedBranch.id === id) {
          setSelectedBranch(updated);
        }
        return updated;
      }
      return b;
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert('카카오 지도 라이브러리가 로드되지 않았습니다.');
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();

    ps.keywordSearch(searchTerm, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const firstPlace = data[0];
        const searchedBranch = {
          id: Date.now(),
          name: firstPlace.place_name,
          address: firstPlace.road_address_name || firstPlace.address_name,
          status: '정상 운영',
          stockNum: 90,
          isCustom: false,
          isFavorite: false
        };
        setSelectedBranch(searchedBranch);
      } else {
        geocoder.addressSearch(searchTerm, (result: any, geocoderStatus: any) => {
          if (geocoderStatus === window.kakao.maps.services.Status.OK && result.length > 0) {
            const firstResult = result[0];
            const searchedBranch = {
              id: Date.now(),
              name: searchTerm,
              address: firstResult.road_address ? firstResult.road_address.address_name : firstResult.address_name,
              status: '정상 운영',
              stockNum: 90,
              isCustom: false,
              isFavorite: false
            };
            setSelectedBranch(searchedBranch);
          } else {
            alert('검색 결과를 찾을 수 없습니다.');
          }
        });
      }
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setBranches(prev => prev.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreAddress.trim()) {
      alert('카페 이름과 주소를 모두 입력해주세요.');
      return;
    }

    const newBranch = {
      id: Date.now(),
      name: newStoreName,
      address: newStoreAddress,
      status: '정상 운영',
      stockNum: 100,
      isCustom: true,
      isFavorite: false
    };

    setBranches(prev => [newBranch, ...prev].slice(0, 10));
    setNewStoreName('');
    setNewStoreAddress('');
    setIsAddModalOpen(false);
    setSelectedBranch(newBranch);
  };

  const handleDeleteStore = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (branches.length <= 1) {
      alert('최소 1개 이상의 장소는 남아있어야 합니다.');
      return;
    }

    if (confirm('정말 이 장소를 목록에서 삭제하시겠습니까?')) {
      const updated = branches.filter(b => b.id !== id);
      setBranches(updated);
      if (selectedBranch.id === id) {
        setSelectedBranch(updated[0]);
      }
    }
  };

  const handleOpenEditModal = (e: React.MouseEvent, branch: any) => {
    e.stopPropagation();
    setEditingId(branch.id);
    setEditStoreName(branch.name);
    setEditStoreAddress(branch.address);
    setIsEditModalOpen(true);
  };

  const handleUpdateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStoreName.trim() || !editStoreAddress.trim()) {
      alert('카페 이름과 주소를 모두 입력해주세요.');
      return;
    }

    setBranches(prev => prev.map(b => {
      if (b.id === editingId) {
        const updated = {
          ...b,
          name: editStoreName,
          address: editStoreAddress,
          isCustom: true
        };
        if (selectedBranch.id === editingId) {
          setSelectedBranch(updated);
        }
        return updated;
      }
      return b;
    }));

    setIsEditModalOpen(false);
    setEditingId(null);
  };

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

      const map = new window.kakao.maps.Map(container, options);
      const roadview = new window.kakao.maps.Roadview(roadviewContainer);
      const roadviewClient = new window.kakao.maps.RoadviewClient();
      const geocoder = new window.kakao.maps.services.Geocoder();

      mapInstanceRef.current = map;
      roadviewInstanceRef.current = roadview;
      roadviewClientRef.current = roadviewClient;

      window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          let addressStr = '사용자 지정 클릭 위치';
          if (status === window.kakao.maps.services.Status.OK) {
            addressStr = result[0].address ? result[0].address.address_name : result[0].road_address.address_name;
          }

          const clickedBranch = {
            id: Date.now(),
            name: '지도 직접 선택 장소',
            address: addressStr,
            status: '정상 운영',
            stockNum: 100,
            isCustom: true,
            isFavorite: false
          };

          setSelectedBranch(clickedBranch);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const roadview = roadviewInstanceRef.current;
    const roadviewClient = roadviewClientRef.current;
    const geocoder = new window.kakao.maps.services.Geocoder();

    const updateMapAndRoadview = (coords: any, title: string) => {
      map.setCenter(coords);

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: coords
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div class="map-infowindow">${title}</div>`
      });
      infowindow.open(map, marker);

      roadviewClient.getNearestPanoId(coords, 300, (panoId: any) => {
        if (panoId) {
          roadview.setPanoId(panoId, coords);
        }
      });

      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      if (showDeliveryRoute) {
        const linePath = [
          new window.kakao.maps.LatLng(35.1796, 129.0756),
          coords
        ];
        const polyline = new window.kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 5,
          strokeColor: '#d32f2f',
          strokeOpacity: 0.8,
          strokeStyle: 'solid'
        });
        polyline.setMap(map);
        polylineRef.current = polyline;
      }

      setTimeout(() => {
        map.relayout();
        roadview.relayout();
        map.setCenter(coords);
      }, 150);
    };

    geocoder.addressSearch(selectedBranch.address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        updateMapAndRoadview(coords, selectedBranch.name);
      } else {
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(selectedBranch.name, (data: any, psStatus: any) => {
          if (psStatus === window.kakao.maps.services.Status.OK && data.length > 0) {
            const coords = new window.kakao.maps.LatLng(data[0].y, data[0].x);
            updateMapAndRoadview(coords, selectedBranch.name);
          }
        });
      }
    });
  }, [selectedBranch, showDeliveryRoute]);

  const toggleRoadviewFullscreen = () => {
    setIsRoadviewFullscreen(prev => !prev);
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.relayout();
      if (roadviewInstanceRef.current) roadviewInstanceRef.current.relayout();
    }, 200);
  };

  return (
    <div className={`map-page-container ${isRoadviewFullscreen ? 'fullscreen-mode' : ''}`}>
      
      <div className="map-header">
        <h2 className="map-title">🧁 부산 인기 디저트 카페 종합 관리 지도 및 로드뷰</h2>
        <p className="map-subtitle">부산 지역 유명 가맹점의 실시간 위치 지도와 주변 실제 거리(로드뷰)를 확인합니다.</p>
        
        {alertBranches.length > 0 && (
          <div className="emergency-alert-banner">
            ⚠️ <strong>긴급 알림</strong>: 현재 혼잡 또는 점검 중인 매장이 총 <strong>{alertBranches.length}곳</strong> 있습니다 ({alertBranches.map(b => b.name).join(', ')}). 물류 재고 배송을 확인하세요!
          </div>
        )}
      </div>

      <div className="map-layout">
        
        <div className="card-box left-sidebar-box">
          <div className="list-top-row">
            <h4 className="section-title">📍 부산 인기 카페 목록 ({branches.length}/10개)</h4>
            <button onClick={() => setIsAddModalOpen(true)} className="add-store-btn">
              + 장소 추가
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              placeholder="아무 장소나 입력 후 Enter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-submit-btn">검색</button>
          </form>

          <div className="filter-controls-row">
            <div className="filter-tabs">
              {['전체', '정상 운영', '혼잡', '점검 중'].map(status => (
                <button
                  key={status}
                  type="button"
                  className={`filter-tab-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => setShowDeliveryRoute(prev => !prev)}
              className={`route-toggle-btn ${showDeliveryRoute ? 'active' : ''}`}
              title="물류 배송 최단 경로선 표시"
            >
              🚚 배송선
            </button>
          </div>

          <div className="branch-list-scroll">
            {filteredBranches.map((branch) => {
              const isSelected = selectedBranch.id === branch.id;
              return (
                <div 
                  key={branch.id} 
                  onClick={() => setSelectedBranch(branch)}
                  className={`branch-item ${isSelected ? 'selected' : ''} ${branch.isCustom ? 'custom-item' : ''}`}
                >
                  <div className="branch-item-header">
                    <div className="branch-title-area">
                      <button 
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, branch.id)}
                        className={`favorite-icon-btn ${branch.isFavorite ? 'active' : ''}`}
                        title="즐겨찾기 고정"
                      >
                        ★
                      </button>
                      <strong className="branch-name">
                        {branch.name}
                      </strong>
                    </div>
                    <div className="branch-action-group">
                      <button 
                        type="button"
                        onClick={(e) => handleCycleStatus(e, branch.id)}
                        className={`branch-status-interactive ${branch.status === '정상 운영' ? 'normal' : branch.status === '혼잡' ? 'busy' : 'check'}`}
                        title="클릭하여 상태 변경"
                      >
                        {branch.status} 🔄
                      </button>

                      <button 
                        type="button" 
                        onClick={(e) => handleOpenEditModal(e, branch)} 
                        className="icon-action-btn edit-btn"
                        title="수정"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      {/* 🛠️ SVG 속성(stroke 등)을 올바르게 채운 삭제 버튼 */}
                      <button 
                        type="button" 
                        onClick={(e) => handleDeleteStore(e, branch.id)} 
                        className="icon-action-btn delete-btn"
                        title="삭제"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                          <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="branch-address">{branch.address}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="map-right-section">
          <div className="card-box map-card-wrapper map-box-wrapper">
            <div id="kakao-map" className="kakao-map-container"></div>
          </div>

          <div className="card-box map-card-wrapper roadview-wrapper-box">
            <div id="kakao-roadview" className={`kakao-map-container ${isRoadviewFullscreen ? 'fullscreen-roadview' : ''}`}></div>
            
            <button 
              type="button" 
              onClick={toggleRoadviewFullscreen}
              className="roadview-fullscreen-btn"
              title={isRoadviewFullscreen ? "전체화면 해제" : "로드뷰 전체화면"}
            >
              {isRoadviewFullscreen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path>
                </svg>
              )}
            </button>
          </div>

          <div className="card-box info-panel info-panel-box">
            <div className="info-panel-content">
              <div>
                <span className="info-label">선택된 카페 재고 여유율</span>
                <h4 className="info-value">{selectedBranch.name} ({selectedBranch.stockNum}%)</h4>
              </div>
              <button className="action-button">
                📦 해당 카페 재고 상세 조회
              </button>
            </div>
          </div>
        </div>

      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">새로운 카페 장소 추가</h3>
            <p className="modal-desc">직접 추가한 장소는 목록 맨 위에 고정되며, 최대 10개까지 유지됩니다.</p>
            
            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label className="form-label">카페 이름</label>
                <input 
                  type="text" 
                  placeholder="예: 부산시민공원점 디저트랩" 
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-lg">
                <label className="form-label">도로명 또는 지번 주소</label>
                <input 
                  type="text" 
                  placeholder="예: 부산광역시 부산진구 시민공원로 73" 
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="modal-btn-cancel">취소</button>
                <button type="submit" className="modal-btn-submit">추가하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">카페 정보 수정</h3>
            <p className="modal-desc">선택한 카페의 이름과 주소를 변경합니다.</p>
            
            <form onSubmit={handleUpdateStore}>
              <div className="form-group">
                <label className="form-label">카페 이름</label>
                <input 
                  type="text" 
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group mb-lg">
                <label className="form-label">도로명 또는 지번 주소</label>
                <input 
                  type="text" 
                  value={editStoreAddress}
                  onChange={(e) => setEditStoreAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="modal-btn-cancel">취소</button>
                <button type="submit" className="modal-btn-submit">수정완료</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}