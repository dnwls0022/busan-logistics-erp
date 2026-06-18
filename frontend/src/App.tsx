import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ==========================================
// 1. 데이터 구조 정의
// ==========================================
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

function App() {
  // ==========================================
  // 2. 상태(State) 관리
  // ==========================================
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const [userBudget, setUserBudget] = useState<number>(300000);
  const [cart, setCart] = useState<CartItem[]>([]); 

  // [음악 기능 상태 추가]
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 3. 효과(Effect) 관리 (API 및 오디오)
  // ==========================================
  useEffect(() => {
    // API 연동
    fetch('http://localhost:8080/api/inventories') 
      .then(response => {
        if (!response.ok) throw new Error('서버 연결 실패');
        return response.json();
      })
      .then(data => setInventories(data))
      .catch(error => console.error("❌ 백엔드 연결 실패:", error));

    // 오디오 객체 초기화
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

  // ==========================================
  // 4. 로직 관리
  // ==========================================
  const totalCurrentInventory = inventories.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAvailableInventory = inventories.reduce((sum, item) => item.quantity > 0 ? sum + item.quantity : sum, 0);

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

  const totalCartPrice = cart.reduce((sum, c) => sum + (c.price * c.orderQuantity), 0);
  const totalCartCount = cart.reduce((sum, c) => sum + c.orderQuantity, 0);
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

  // ==========================================
  // 5. UI 렌더링
  // ==========================================
  return (
    <div className="cafe-container">
      <div className="cafe-header">
        <span>☕</span>
        <h1>CAFE LOGISTICS ERP</h1>
        
        {/* 예쁘게 바뀐 음악 플레이어 UI */}
        <div className="music-player-zone">
          <div className="music-info">
            <h4>작은 봄</h4>
            <p>고추잠자리</p>
          </div>
          <button className="player-btn" onClick={toggleMusic}>
            {isPlaying ? '⏸ 일시정지' : '▶ 재생하기'}
          </button>
        </div>

        <p>부산 광역 물류 네트워크 시스템 - 26개 지점 통합 재고 관리 및 대시보드</p>
        <div className="cafe-title-line"></div>
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
            {currentItems.map((item) => (
              <div key={item.id} className="product-card">
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
            ))}
          </div>

          <div className="pagination-zone">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>◀ Prev</button>
            <span className="page-info">{currentPage} / {totalPages} Page</span>
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next ▶</button>
          </div>
        </div>

        <div className="right-sidebar">
          <div className="receipt-title">📋 CAFE INTEGRATED BILL</div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', color: '#8d7967', fontWeight: 'bold' }}>💵 통합 가용 예산 설정</label>
            <input type="number" className="budget-input-box" value={userBudget} onChange={(e) => setUserBudget(Number(e.target.value))} />
          </div>

          <div className="cart-list">
            {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#8d7967', padding: '50px 0' }}>🛒 상품을 담아주세요.</p> :
              cart.map((c) => (
                <div key={c.inventoryId} className="cart-item">
                  <div className="cart-item-info">
                    <h4 style={{ fontSize: '13px', margin: 0 }}>{c.productName}</h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px' }}>{c.price.toLocaleString()}원 × {c.orderQuantity}개</p>
                  </div>
                  <div className="cart-item-control">
                    <button className="cart-btn-mini" onClick={() => updateCartQuantity(c.inventoryId, -1)}>-</button>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', padding: '0 5px' }}>{c.orderQuantity}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;