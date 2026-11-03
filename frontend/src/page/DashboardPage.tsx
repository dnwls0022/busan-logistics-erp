import { useState, useEffect, useRef } from 'react';
import '../App.css';

interface Store {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface InventoryItem {
  id: number;
  store: Store;
  product: Product;
  quantity: number;
}

interface CartItem {
  inventoryId: number;
  productName: string;
  price: number;
  orderQuantity: number; 
  maxAvailable: number;  
}

export default function DashboardPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [userBudget, setUserBudget] = useState<number>(300000);
  const [cart, setCart] = useState<CartItem[]>([]); 
  const [orderStatus, setOrderStatus] = useState<'IDLE' | 'PENDING' | 'PREPARING' | 'SHIPPING'>('IDLE');

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/inventories?size=1000') 
      .then(response => {
        if (!response.ok) throw new Error('서버 연결 실패');
        return response.json();
      })
      .then(data => setInventories(data))
      .catch(error => console.error("❌ 백엔드 연결 실패:", error));

    audioRef.current = new Audio('/작은 봄_고추잠자리.mp3');
    audioRef.current.loop = true;
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("재생 차단됨:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const totalCurrentInventory = inventories.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAvailableInventory = inventories.reduce((sum, item) => item.quantity > 0 ? sum + item.quantity : sum, 0);

  // 안전재고 임계값(예: 60개 이하) 재고 부족 품목 건수 계산
  const lowStockCount = inventories.filter(item => item.quantity > 0 && item.quantity <= 60).length;

  const addToCart = (item: InventoryItem) => {
    if (!item || item.quantity <= 0) return; 
    setCart(prevCart => {
      const existing = prevCart.find(c => c.inventoryId === item.id);
      if (existing) {
        if (existing.orderQuantity < item.quantity) {
          return prevCart.map(c => c.inventoryId === item.id ? { ...c, orderQuantity: c.orderQuantity + 1 } : c);
        }
        return prevCart;
      } else {
        return [...prevCart, {
          inventoryId: item.id,
          productName: `[${item.store?.name || '지점'}] ${item.product?.name || '상품'}`,
          price: item.product?.price || 0,
          orderQuantity: 1,
          maxAvailable: item.quantity
        }];
      }
    });
  };

  const updateCartQuantity = (inventoryId: number, amount: number) => {
    setCart(prevCart => prevCart.map(c => {
      if (c.inventoryId === inventoryId) {
        const nextQty = c.orderQuantity + amount;
        if (nextQty <= 0) return { ...c, orderQuantity: 1 };
        if (nextQty > c.maxAvailable) return c; 
        return { ...c, orderQuantity: nextQty };
      }
      return c;
    }));
  };

  const removeFromCart = (inventoryId: number) => {
    setCart(prevCart => prevCart.filter(c => c.inventoryId !== inventoryId));
  };

  const handleOrder = () => {
    if (cart.length === 0) return alert('발주할 항목을 담아주세요.');
    setOrderStatus('PENDING');
    alert('본사 물류센터로 발주가 신청되었습니다.');
  };

  const totalCartPrice = cart.reduce((sum, c) => sum + (c.price * c.orderQuantity), 0);
  const changeMoney = userBudget - totalCartPrice;
  const isOverBudget = changeMoney < 0; 

  const filteredInventories = inventories.filter(item => {
    const pName = item.product?.name?.toLowerCase() || '';
    const sName = item.store?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return pName.includes(search) || sName.includes(search);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventories.length / itemsPerPage) || 1;

  return (
    <div className="cafe-container">
      {/* ☕ 상단 로고 및 음악 플레이어 영역 (기존 형태 완벽 보존) */}
      <div className="cafe-header">
        <span>☕</span>
        <h1>CAFE LOGISTICS ERP</h1>
        
        <div className="music-player-zone">
          <div className="music-info">
            <h4>작은 봄</h4>
            <p>고추잠자리</p>
          </div>
          <button className="player-btn" onClick={toggleMusic}>
            {isPlaying ? '⏸ 일시정지' : '▶ 재생하기'}
          </button>
        </div>

        <p>부산 디저트카페 종합 관리 및 대시보드</p>
        <div className="cafe-title-line"></div>
      </div>

      {/* 🚨 상단 실시간 재고 부족 요약 티커 추가 */}
      <div style={{
        backgroundColor: '#FFF3CD',
        border: '1px solid #FFEEBA',
        color: '#856404',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        <span>🚨 [긴급 물류 알림]</span>
        <span>현재 전국 매장 중 재고 부족(안전재고 60개 이하) 품목이 총 <strong>{lowStockCount}건</strong> 있습니다. 즉시 발주를 검토하세요.</span>
      </div>

      <div className="dashboard-zone">
        <div className="board-card available">
          <h2>An Available Stock (출고 가능 총 재고)</h2>
          <p>{totalAvailableInventory.toLocaleString()} 개</p>
        </div>
        <div className="board-card current">
          <h2>Total Current Stock (전체 매장 재고 총합)</h2>
          <p>{totalCurrentInventory.toLocaleString()} 개</p>
        </div>
      </div>

      <div className="cafe-main-layout">
        <div className="left-content">
          <div className="search-zone">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 상품명 또는 지점명을 입력하세요..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="product-grid">
            {currentItems.map((item) => {
              const isLowStock = item.quantity > 0 && item.quantity <= 60;
              return (
                <div key={item.id} className="product-card" style={{ position: 'relative' }}>
                  {/* 🚨 안전재고 임계값 경고 뱃지 */}
                  {isLowStock && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#DC3545',
                      color: '#FFF',
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      zIndex: 2
                    }}>
                      긴급 발주 필요
                    </span>
                  )}

                  <div className="card-top-line"></div>
                  <div className="card-body">
                    <span className="store-badge">📍 {item.store?.name}</span>
                    <h3 className="product-title">{item.product?.name}</h3>
                    <p className="product-price">{(item.product?.price || 0).toLocaleString()} 원</p>
                    <div className={`quantity-box ${item.quantity === 0 ? 'sold-out' : ''}`}>
                      <span>매장 보유고</span>
                      <span className="quantity-value">{item.quantity === 0 ? '품절 ☕' : `${item.quantity} 개`}</span>
                    </div>
                  </div>
                  <button className="btn-select" onClick={() => addToCart(item)} disabled={item.quantity === 0}>
                    {item.quantity === 0 ? '선택 불가' : '주문서에 담기 🛒'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pagination-zone">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Prev</button>
            
            <div className="page-info inline-flex-center">
              <input 
                type="number" 
                min={1} 
                max={totalPages} 
                value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="page-input-box"
              />
              <span>/ {totalPages} Page</span>
            </div>

            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next ▶</button>
          </div>
        </div>

        {/* 우측 사이드바: 빌, 예산, 파이프라인 및 배송 경로 연동 */}
        <div className="right-sidebar">
          <div className="receipt-title">📋 CAFE INTEGRATED BILL</div>
          <div className="budget-section-wrap">
            <label className="budget-label">💵 통합 가용 예산 설정</label>
            <input type="number" className="budget-input-box" value={userBudget} onChange={(e) => setUserBudget(Number(e.target.value))} />
          </div>

          <div className="cart-list">
            {cart.length === 0 ? <p className="cart-empty-text">🛒 상품을 담아주세요.</p> :
              cart.map((c) => (
                <div key={c.inventoryId} className="cart-item">
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{c.productName}</h4>
                    <p className="cart-item-detail">{c.price.toLocaleString()}원 × {c.orderQuantity}개</p>
                  </div>
                  <div className="cart-item-control">
                    <button className="cart-btn-mini" onClick={() => updateCartQuantity(c.inventoryId, -1)}>-</button>
                    <span className="cart-quantity-text">{c.orderQuantity}</span>
                    <button className="cart-btn-mini" onClick={() => updateCartQuantity(c.inventoryId, 1)}>+</button>
                    <button className="cart-btn-delete" onClick={() => removeFromCart(c.inventoryId)}>X</button>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="receipt-summary">
            <div className="summary-row"><span>총 예상 소요 비용</span><strong>{totalCartPrice.toLocaleString()} 원</strong></div>
            <div className="summary-row total">
              <span>{isOverBudget ? '💸 예산 초과' : '🪙 예산 잔액'}</span>
              <span style={{ color: isOverBudget ? '#d32f2f' : '#2e7d32' }}>{Math.abs(changeMoney).toLocaleString()} 원</span>
            </div>

            {/* 본사 발주 신청 버튼 */}
            <button 
              className="btn-select" 
              style={{ width: '100%', marginTop: '12px', backgroundColor: '#4A3B32', color: '#FFF' }}
              onClick={handleOrder}
            >
              본사 발주 신청하기 🚀
            </button>

            {/* 발주 상태 파이프라인 */}
            {orderStatus !== 'IDLE' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#F8F9FA',
                borderRadius: '8px',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div style={{ flex: 1, padding: '4px', borderRadius: '4px', backgroundColor: orderStatus === 'PENDING' ? '#4A3B32' : 'transparent', color: orderStatus === 'PENDING' ? '#FFF' : '#333', fontWeight: 'bold' }}>결재 대기</div>
                <div style={{ flex: 1, padding: '4px', borderRadius: '4px', backgroundColor: orderStatus === 'PREPARING' ? '#4A3B32' : 'transparent', color: orderStatus === 'PREPARING' ? '#FFF' : '#333', fontWeight: 'bold' }}>출고 준비</div>
                <div style={{ flex: 1, padding: '4px', borderRadius: '4px', backgroundColor: orderStatus === 'SHIPPING' ? '#4A3B32' : 'transparent', color: orderStatus === 'SHIPPING' ? '#FFF' : '#333', fontWeight: 'bold' }}>배송 중</div>
              </div>
            )}

            {/* 실시간 배송 경로 지도 퀵 버튼 */}
            <button 
              style={{
                width: '100%',
                backgroundColor: '#6C757D',
                color: '#FFF',
                border: 'none',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              onClick={() => alert('지점 지도 관제 페이지로 이동합니다.')}
            >
              🗺️ 실시간 배송 경로 지도 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}