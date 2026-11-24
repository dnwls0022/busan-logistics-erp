import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

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

interface OrderedSnapshot {
  inventoryId: number;
  quantity: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  const [userBudget, setUserBudget] = useState<number | ''>(() => {
    const saved = localStorage.getItem('dashboard_user_budget');
    return saved !== null ? Number(saved) : '';
  });
  
  const [isBudgetLocked, setIsBudgetLocked] = useState<boolean>(() => {
    return localStorage.getItem('dashboard_budget_locked') === 'true';
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dashboard_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderStatus, setOrderStatus] = useState<'IDLE' | 'PENDING' | 'PREPARING' | 'SHIPPING' | 'COMPLETED'>(() => {
    return (localStorage.getItem('dashboard_order_status') as any) || 'IDLE';
  });
  
  const [lastOrderSummary, setLastOrderSummary] = useState<string>(() => {
    return localStorage.getItem('dashboard_order_summary') || '';
  });
  
  const [lastOrderedItems, setLastOrderedItems] = useState<OrderedSnapshot[]>(() => {
    const saved = localStorage.getItem('dashboard_last_ordered_items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lastOrderTotalPrice, setLastOrderTotalPrice] = useState<number>(() => {
    const saved = localStorage.getItem('dashboard_last_total_price');
    return saved ? Number(saved) : 0;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 예산 및 장바구니 상태 로컬 스토리지 동기화
  useEffect(() => {
    localStorage.setItem('dashboard_user_budget', userBudget.toString());
    localStorage.setItem('dashboard_budget_locked', isBudgetLocked.toString());
  }, [userBudget, isBudgetLocked]);

  useEffect(() => {
    localStorage.setItem('dashboard_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dashboard_order_status', orderStatus);
    localStorage.setItem('dashboard_order_summary', lastOrderSummary);
    localStorage.setItem('dashboard_last_ordered_items', JSON.stringify(lastOrderedItems));
    localStorage.setItem('dashboard_last_total_price', lastOrderTotalPrice.toString());
  }, [orderStatus, lastOrderSummary, lastOrderedItems, lastOrderTotalPrice]);

  // 💡 데이터 로드 및 SCM 승인 연동 처리
  useEffect(() => {
    const savedInventories = localStorage.getItem('dashboard_inventories');
    
    if (savedInventories) {
      try {
        const parsed = JSON.parse(savedInventories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInventories(parsed);
        } else {
          fetchServerInventories();
        }
      } catch (e) {
        fetchServerInventories();
      }
    } else {
      fetchServerInventories();
    }

    audioRef.current = new Audio('/작은 봄_고추잠자리.mp3');
    audioRef.current.loop = true;
  }, []);

  const fetchServerInventories = () => {
    fetch('https://busan-logistics-erp.onrender.com/api/inventories?size=1000') 
      .then(response => {
        if (!response.ok) throw new Error('서버 연결 실패');
        return response.json();
      })
      .then(data => {
        // ✨ 서버에서 가져온 직후 SCM 승인 신호가 있다면 즉시 반영
        let processedData = data;
        const approvedRestockStr = localStorage.getItem('scm_approved_restock');
        if (approvedRestockStr) {
          try {
            const restock = JSON.parse(approvedRestockStr);
            processedData = data.map((inv: InventoryItem) => {
              const matchStore = inv.store?.name === restock.branch;
              const matchProd = inv.product?.name?.includes('버터떡');
              if (matchStore && matchProd) {
                return { ...inv, quantity: inv.quantity + restock.quantity };
              }
              return inv;
            });
          } catch (e) {
            console.error(e);
          }
        }

        setInventories(processedData);
        localStorage.setItem('dashboard_inventories', JSON.stringify(processedData));
      })
      .catch(error => console.error("❌ 백엔드 연결 실패:", error));
  };

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

  const setCartDirectQuantity = (inventoryId: number, value: number | string) => {
    setCart(prevCart => prevCart.map(c => {
      if (c.inventoryId === inventoryId) {
        if (value === '') return { ...c, orderQuantity: 1 };
        const num = Number(value);
        if (num > c.maxAvailable) {
          alert(`재고 부족! 최대 ${c.maxAvailable}개까지만 담을 수 있습니다.`);
          return { ...c, orderQuantity: c.maxAvailable };
        }
        if (num < 1) return { ...c, orderQuantity: 1 };
        return { ...c, orderQuantity: num };
      }
      return c;
    }));
  };

  const removeFromCart = (inventoryId: number) => {
    setCart(prevCart => prevCart.filter(c => c.inventoryId !== inventoryId));
  };

  const totalCartPrice = cart.reduce((sum, c) => sum + (c.price * c.orderQuantity), 0);
  const currentBudgetNum = typeof userBudget === 'number' ? userBudget : 0;
  const changeMoney = currentBudgetNum - totalCartPrice;
  const isOverBudget = currentBudgetNum > 0 && changeMoney < 0; 

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('발주할 항목을 먼저 주문서에 담아주세요.');
      return;
    }
    if (currentBudgetNum === 0) {
      alert('통합 가용 예산을 먼저 입력하고 완료해주세요.');
      return;
    }
    if (isOverBudget) {
      alert(`가용 예산이 ${Math.abs(changeMoney).toLocaleString()}원 초과되었습니다.`);
      return;
    }

    setLastOrderedItems(cart.map(c => ({ inventoryId: c.inventoryId, quantity: c.orderQuantity })));
    setLastOrderTotalPrice(totalCartPrice);

    setInventories(prev => {
      const updated = prev.map(inv => {
        const orderedItem = cart.find(c => c.inventoryId === inv.id);
        if (orderedItem) {
          return { ...inv, quantity: Math.max(0, inv.quantity - orderedItem.orderQuantity) };
        }
        return inv;
      });
      localStorage.setItem('dashboard_inventories', JSON.stringify(updated));
      return updated;
    });

    setUserBudget(prev => (typeof prev === 'number' ? prev - totalCartPrice : ''));
    setLastOrderSummary(`총 ${cart.length}건 (${totalCartPrice.toLocaleString()}원)`);

    setCart([]);
    setOrderStatus('PENDING');
    alert('본사 물류센터로 발주 전표가 전송되었습니다. (현재 상태: 결재 대기)');
  };

  const handleCancelOrder = () => {
    if (!window.confirm('정말 발주를 취소하시겠습니까? 예산과 재고가 원래대로 복구됩니다.')) return;

    setInventories(prev => {
      const updated = prev.map(inv => {
        const restored = lastOrderedItems.find(item => item.inventoryId === inv.id);
        if (restored) {
          return { ...inv, quantity: inv.quantity + restored.quantity };
        }
        return inv;
      });
      localStorage.setItem('dashboard_inventories', JSON.stringify(updated));
      return updated;
    });

    setUserBudget(prev => (typeof prev === 'number' ? prev + lastOrderTotalPrice : lastOrderTotalPrice));

    setOrderStatus('IDLE');
    setLastOrderSummary('');
    setLastOrderedItems([]);
    setLastOrderTotalPrice(0);
    localStorage.removeItem('dashboard_order_status');
    localStorage.removeItem('dashboard_order_summary');
    localStorage.removeItem('dashboard_last_ordered_items');
    localStorage.removeItem('dashboard_last_total_price');
    alert('발주가 취소되었으며, 예산과 재고가 원래 상태로 복구되었습니다.');
  };

  const handleAdvancePipeline = () => {
    if (orderStatus === 'PENDING') {
      setOrderStatus('PREPARING');
    } else if (orderStatus === 'PREPARING') {
      setOrderStatus('SHIPPING');
    } else if (orderStatus === 'SHIPPING') {
      alert('해당 발주 건의 지점 배송이 완료되었습니다!');
      setOrderStatus('IDLE');
      setLastOrderSummary('');
      setLastOrderedItems([]);
      setLastOrderTotalPrice(0);
      localStorage.removeItem('dashboard_order_status');
      localStorage.removeItem('dashboard_order_summary');
      localStorage.removeItem('dashboard_last_ordered_items');
      localStorage.removeItem('dashboard_last_total_price');
    }
  };

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

      <div className="alert-banner">
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
                <div key={item.id} className="product-card">
                  {isLowStock && <span className="urgent-badge">긴급 발주 필요</span>}

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
                type="number" min={1} max={totalPages} value={currentPage}
                onChange={(e) => {
                  const page = Number(e.target.value);
                  if (page >= 1 && page <= totalPages) setCurrentPage(page);
                }}
                className="page-input-box"
              />
              <span>/ {totalPages} Page</span>
            </div>

            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next ▶</button>
          </div>
        </div>

        <div className="right-sidebar">
          <div className="receipt-title">📋 CAFE INTEGRATED BILL</div>
          
          <div className="budget-section-wrap">
            <label className="budget-label">
              <span>💵 통합 가용 예산 설정</span>
              <span className="budget-sub-text">원하는 금액을 입력하세요</span>
            </label>

            <div className="budget-input-group">
              <input 
                type="number" className="budget-input-box" placeholder="예: 300000"
                value={userBudget} disabled={isBudgetLocked}
                style={{ backgroundColor: isBudgetLocked ? '#F0EFEA' : '#FFFFFF' }}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserBudget(val === '' ? '' : Number(val));
                }} 
              />
              {!isBudgetLocked ? (
                <button type="button" className="budget-action-btn complete" onClick={() => {
                  if (userBudget === '' || userBudget <= 0) {
                    alert('유효한 예산 금액을 입력해주세요.');
                    return;
                  }
                  setIsBudgetLocked(true);
                }}>
                  입력 완료
                </button>
              ) : (
                <button type="button" className="budget-action-btn edit" onClick={() => setIsBudgetLocked(false)}>
                  금액 수정
                </button>
              )}
            </div>
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
                    <input
                      type="number" min={1} max={c.maxAvailable} value={c.orderQuantity}
                      onChange={(e) => setCartDirectQuantity(c.inventoryId, e.target.value)}
                      className="cart-input-qty"
                    />
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
              <span className={isOverBudget ? 'text-over' : 'text-normal'}>{Math.abs(changeMoney).toLocaleString()} 원</span>
            </div>

            <button 
              className={`btn-select order-submit-btn ${isOverBudget ? 'disabled' : ''}`}
              onClick={handleOrder}
            >
              본사 발주 신청하기 🚀
            </button>

            {orderStatus !== 'IDLE' && (
              <div className="pipeline-container">
                <div className="pipeline-header">
                  <span>📦 진행 중인 발주 ({lastOrderSummary})</span>
                </div>

                <div className="pipeline-steps">
                  <div onClick={() => setOrderStatus('PENDING')} className={`pipeline-step ${orderStatus === 'PENDING' ? 'active' : ''}`}>결재 대기</div>
                  <div onClick={() => setOrderStatus('PREPARING')} className={`pipeline-step ${orderStatus === 'PREPARING' ? 'active' : ''}`}>출고 준비</div>
                  <div onClick={() => setOrderStatus('SHIPPING')} className={`pipeline-step ${orderStatus === 'SHIPPING' ? 'active' : ''}`}>배송 중</div>
                </div>

                <div className="pipeline-actions">
                  <button type="button" onClick={handleAdvancePipeline} className="pipeline-advance-btn">
                    {orderStatus === 'PENDING' && '✅ 결재 승인 ▶'}
                    {orderStatus === 'PREPARING' && '🚚 상차 완료 ▶'}
                    {orderStatus === 'SHIPPING' && '🏁 지점 입고 완료'}
                  </button>
                  <button type="button" onClick={handleCancelOrder} className="pipeline-cancel-btn">
                    발주 취소 ❌
                  </button>
                </div>
              </div>
            )}

            <button className="map-move-btn" onClick={() => navigate('/map')}>
              🗺️ 실시간 배송 경로 지도 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}