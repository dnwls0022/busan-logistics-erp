import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InventoryLogPage.css';

interface LogItem {
  id: number;
  date: string;
  branch: string;
  item: string;
  type: '입고' | '출고';
  quantity: number;
  status: '승인대기' | '승인완료' | '반려';
  targetProductName?: string; // 어떤 품목인지 매핑용
}

interface ShortageItem {
  id: number;
  itemCode: string;
  itemName: string;
  currentStock: number;
  safeStock: number;
  price: number; 
  timerSeconds: number; 
  isOrdering: boolean;  
}

export default function InventoryLogPage() {
  const navigate = useNavigate();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('scm_admin_logged_in') === 'true';
  });
  
  const [loginForm, setLoginForm] = useState({ id: '', password: '', adminCode: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!/^\d{4}$/.test(loginForm.adminCode)) {
      setErrorMessage("관리자 코드는 반드시 숫자 4자리여야 합니다. (ex: 7328)");
      return;
    }

    try {
      const response = await axios.post('/api/users/login/admin', {
        email: loginForm.id,
        password: loginForm.password,
        adminCode: loginForm.adminCode
      });

      const userData = response.data;

      if (userData.role !== 'ADMIN') {
        setErrorMessage("⚠️ 지점 관리자 권한이 없는 계정입니다.");
        return;
      }

      sessionStorage.setItem('scm_admin_logged_in', 'true');
      setIsAdminLoggedIn(true);
      alert("🔐 지점 관리자 인증이 완료되었습니다.");
    } catch (err: any) {
      if (err.response && err.response.data) {
        setErrorMessage(typeof err.response.data === 'string' ? err.response.data : "로그인에 실패했습니다.");
      } else {
        setErrorMessage("서버 통신 중 오류가 발생했습니다.");
      }
    }
  };

  // 📋 입고 내역 리스트 (실제 메인 대시보드 품목인 '맛있는 버터떡 1' 연동 포함)
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 1, date: '2026-11-04 10:30', branch: '부산 센텀점', item: '맛있는 버터떡 1 (긴급 자동발주)', type: '입고', quantity: 50, status: '승인대기', targetProductName: '맛있는 버터떡 1' },
    { id: 2, date: '2026-11-04 09:15', branch: '부산 센텀점', item: '스페셜 원두 1kg', type: '입고', quantity: 20, status: '승인대기' },
    { id: 3, date: '2026-11-03 16:40', branch: '부산 남포점', item: '맛있는 버터떡 1', type: '출고', quantity: 30, status: '반려' },
  ]);

  const [shortageItems, setShortageItems] = useState<ShortageItem[]>(() => {
    const savedItems = localStorage.getItem('scm_shortage_items');
    const savedTimes = localStorage.getItem('scm_timer_states');
    
    const initialItems: ShortageItem[] = [
      { id: 101, itemCode: 'PRD-001', itemName: '맛있는 버터떡 1', currentStock: 0, safeStock: 20, price: 1600, timerSeconds: 60, isOrdering: false },
      { id: 102, itemCode: 'PRD-002', itemName: '스페셜 원두 1kg', currentStock: 4, safeStock: 20, price: 25000, timerSeconds: 7200, isOrdering: false },
      { id: 103, itemCode: 'PRD-003', itemName: '프리미엄 바닐라 시럽', currentStock: 2, safeStock: 15, price: 14000, timerSeconds: 1800, isOrdering: false },
    ];

    if (!savedItems || !savedTimes) return initialItems;

    try {
      const parsedItems: ShortageItem[] = JSON.parse(savedItems);
      const timerStates: Record<number, { targetEndTime: number }> = JSON.parse(savedTimes);
      const now = Date.now();

      return parsedItems.map(item => {
        const state = timerStates[item.id];
        if (state && state.targetEndTime) {
          const remainingSec = Math.max(0, Math.floor((state.targetEndTime - now) / 1000));
          if (remainingSec > 0) {
            return { ...item, isOrdering: true, timerSeconds: remainingSec };
          } else {
            const resetTime = 60;
            return { ...item, isOrdering: false, currentStock: item.currentStock + 50, timerSeconds: resetTime };
          }
        }
        return item;
      });
    } catch (e) {
      return initialItems;
    }
  });

  const [filterType, setFilterType] = useState<'전체' | '입고' | '출고' | '재고부족'>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const interval = setInterval(() => {
      setShortageItems(prevItems => {
        let hasChanges = false;
        const updated = prevItems.map(item => {
          if (item.isOrdering && item.timerSeconds > 0) {
            hasChanges = true;
            return { ...item, timerSeconds: item.timerSeconds - 1 };
          }
          if (item.isOrdering && item.timerSeconds === 0) {
            hasChanges = true;
            triggerAutoRestock(item);
            
            const existingTimers = JSON.parse(localStorage.getItem('scm_timer_states') || '{}');
            delete existingTimers[item.id];
            localStorage.setItem('scm_timer_states', JSON.stringify(existingTimers));

            const resetTime = 60;
            return { ...item, isOrdering: false, currentStock: item.currentStock + 50, timerSeconds: resetTime };
          }
          return item;
        });

        if (hasChanges) {
          localStorage.setItem('scm_shortage_items', JSON.stringify(updated));
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  const triggerAutoRestock = (item: ShortageItem) => {
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newLog: LogItem = {
      id: Date.now(),
      date: dateString,
      branch: '부산 센텀점',
      item: item.itemName,
      type: '입고',
      quantity: 50,
      status: '승인대기', // 타이머 완료 후 입고 내역에 '승인대기' 상태로 등록됨
      targetProductName: item.itemName
    };

    setLogs(prev => [newLog, ...prev]);
    alert(`🚀 [SCM 자동 발주 완료] '${item.itemName}' 타이머가 완료되어 입고 승인 대기열에 등록되었습니다!`);
  };

  const handleStartOrder = (id: number) => {
    const now = Date.now();
    setShortageItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const targetEndTime = now + item.timerSeconds * 1000;
          const existingTimers = JSON.parse(localStorage.getItem('scm_timer_states') || '{}');
          existingTimers[id] = { targetEndTime };
          localStorage.setItem('scm_timer_states', JSON.stringify(existingTimers));

          return { ...item, isOrdering: true };
        }
        return item;
      });
      localStorage.setItem('scm_shortage_items', JSON.stringify(updated));
      return updated;
    });
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="scm-auth-wrapper">
        <div className="scm-auth-card">
          <h3 className="scm-auth-title">🔐 지점 관리자 인증</h3>
          <p className="scm-auth-desc">SCM 관리 페이지에 접근하려면 관리자 로그인이 필요합니다.</p>
          
          <form onSubmit={handleAdminLoginSubmit} className="scm-auth-form">
            <input
              type="email"
              placeholder="관리자 이메일 (ex: admin@test.com)"
              value={loginForm.id}
              onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
              required
              className="scm-auth-input"
            />
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
              className="scm-auth-input"
            />
            <input
              type="text"
              placeholder="관리자 코드 숫자 4자리 (ex: 7328)"
              value={loginForm.adminCode}
              onChange={(e) => setLoginForm({ ...loginForm, adminCode: e.target.value })}
              maxLength={4}
              required
              className="scm-auth-input"
            />
            
            {errorMessage && <p className="scm-auth-error">{errorMessage}</p>}
            
            <button type="submit" className="scm-auth-submit-btn">
              관리자 인증 및 입장
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="scm-auth-back-btn"
          >
            ← 메인 대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ✨ 핵심 연동: 입고 내역에서 [승인]을 누르면 대시보드 품절 매장에 재고가 반영되도록 신호 전송
  const handleStatusChange = (id: number, newStatus: '승인완료' | '반려') => {
    const targetLog = logs.find(log => log.id === id);
    
    setLogs(logs.map(log => log.id === id ? { ...log, status: newStatus } : log));

    if (newStatus === '승인완료' && targetLog) {
      // 대시보드 품절 해제를 위해 localStorage에 승인 내역 저장
      const restockData = {
        branch: targetLog.branch,
        productName: targetLog.targetProductName || targetLog.item,
        quantity: targetLog.quantity,
        timestamp: Date.now()
      };
      localStorage.setItem('scm_approved_restock', JSON.stringify(restockData));
      
      alert(`✅ [입고 승인 완료] '${targetLog.branch}'의 '${restockData.productName}' ${targetLog.quantity}개 입고가 최종 승인되어 메인 대시보드 품절 상태가 해제됩니다!`);
    } else {
      alert(`해당 물류 요청이 [${newStatus}] 처리되었습니다.`);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}시간 ${minutes}분 ${seconds}초`;
    return `${minutes}분 ${seconds}초`;
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === '전체' || log.type === filterType;
    const matchesSearch = log.branch.includes(searchTerm) || log.item.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  const filteredShortage = shortageItems.filter(item =>
    item.itemName.includes(searchTerm) || item.itemCode.includes(searchTerm)
  );

  return (
    <div className="scm-container">
      <div className="scm-header">
        <h2>📦 실시간 입출고 내역 및 SCM 공급망 관리 (관리자 전용)</h2>
        <p>전국 지점의 물품 이동 히스토리를 추적하고 SCM 가격대별 자동 발주 타이머를 관리합니다.</p>
        <div className="scm-title-line"></div>
      </div>

      <div className="scm-filter-bar">
        <div className="scm-filter-btns">
          {(['전체', '입고', '출고', '재고부족'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`scm-btn-tab ${filterType === type ? 'active' : ''}`}
            >
              {type === '재고부족' ? '🚨 재고부족 (SCM 타이머)' : `${type} 내역`}
            </button>
          ))}
        </div>
        <div>
          <input
            type="text"
            placeholder={filterType === '재고부족' ? "상품명 또는 코드 검색..." : "지점명 또는 품목 검색..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="scm-search-input"
          />
        </div>
      </div>

      {filterType === '재고부족' ? (
        <div className="scm-table-wrapper">
          <div className="scm-guide-banner">
            💡 <b>SCM 자동 발주 시스템 안내:</b> 타이머 완료 시 입고 대기열로 넘어가며, 입고 승인 시 대시보드 품절 매장의 재고가 자동으로 채워집니다.
          </div>
          <table className="scm-table">
            <thead>
              <tr>
                <th>상품 코드</th>
                <th>품목명</th>
                <th>현재 재고 / 안전재고</th>
                <th>단가</th>
                <th>가격대 등급</th>
                <th>자동 발주 타이머</th>
                <th className="text-center">SCM 조치</th>
              </tr>
            </thead>
            <tbody>
              {filteredShortage.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold text-muted">{item.itemCode}</td>
                  <td className="fw-bold text-danger">⚠️ {item.itemName}</td>
                  <td>
                    <span className="fw-bold text-danger">{item.currentStock}개</span> 
                    <span className="text-muted"> (안전: {item.safeStock}개)</span>
                  </td>
                  <td className="fw-bold">{item.price.toLocaleString()}원</td>
                  <td>
                    {item.price >= 20000 ? (
                      <span className="badge-type price-high">고가품 (2시간)</span>
                    ) : item.price >= 1000 ? (
                      <span className="badge-type price-mid">중가품 (30분)</span>
                    ) : (
                      <span className="badge-type price-low">소모품 (5분)</span>
                    )}
                  </td>
                  <td>
                    {item.isOrdering ? (
                      <span className="timer-active">
                        ⏳ 남은 시간: {formatTime(item.timerSeconds)}
                      </span>
                    ) : (
                      <span className="text-muted small">대기 중</span>
                    )}
                  </td>
                  <td className="text-center">
                    {!item.isOrdering ? (
                      <button onClick={() => handleStartOrder(item.id)} className="btn-order-start">
                        🚀 자동 발주 시작
                      </button>
                    ) : (
                      <span className="text-muted small">타이머 가동 중...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="scm-table-wrapper">
          <table className="scm-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>요청 일시</th>
                <th>요청 지점</th>
                <th>품목명</th>
                <th>구분</th>
                <th>수량</th>
                <th>처리 상태</th>
                <th className="text-center">관리 조치</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="fw-bold">{log.id}</td>
                  <td className="text-muted">{log.date}</td>
                  <td className="fw-bold">{log.branch}</td>
                  <td>{log.item}</td>
                  <td>
                    <span className={`badge-type ${log.type === '입고' ? 'in' : 'out'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="fw-bold">{log.quantity}개</td>
                  <td>
                    <span className={`status-text ${log.status}`}>
                      ● {log.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {log.status === '승인대기' ? (
                      <div className="action-btns">
                        <button onClick={() => handleStatusChange(log.id, '승인완료')} className="btn-approve">승인</button>
                        <button onClick={() => handleStatusChange(log.id, '반려')} className="btn-reject">반려</button>
                      </div>
                    ) : (
                      <span className="text-muted small">처리 완료됨</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}