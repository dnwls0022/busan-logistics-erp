import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardPage from './page/DashboardPage';
import MapPage from './page/MapPage';
import CommunityPage from './page/CommunityPage';
import AdminPage from './page/AdminPage';
import Mypage from './page/Mypage';
import InventoryLogPage from './page/InventoryLogPage';
import DeliverySchedulePage from './page/DeliverySchedulePage';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#ece5dc', overflow: 'hidden', margin: 0, padding: 0 }}>
      {/* 1. 왼쪽 고정 사이드바 */}
      <div style={{ width: '260px', backgroundColor: '#2c1e1a', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '3px 0 10px rgba(0,0,0,0.15)', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
          <Link to="/" style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
            <span style={{ fontSize: '28px' }}>☕</span>
            <h2 style={{ fontSize: '16px', color: '#d7ccc8', marginTop: '10px' }}>CAFE LOGISTICS ERP</h2>
          </Link>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/" style={navLinkStyle(location.pathname === '/')}>
            📊 대시보드 (재고관리)
          </Link>
          <Link to="/map" style={navLinkStyle(location.pathname === '/map')}>
            🗺️ 지점 지도 보기
          </Link>
          <Link to="/inventory-log" style={navLinkStyle(location.pathname === '/inventory-log')}>
            📦 입출고 및 SCM 관리
          </Link>
          {/* 👇 2. 사이드바 메뉴 추가 */}
          <Link to="/delivery-schedule" style={navLinkStyle(location.pathname === '/delivery-schedule')}>
            📅 배송 스케줄 캘린더
          </Link>
          <Link to="/community" style={navLinkStyle(location.pathname === '/community')}>
            💬 커뮤니티
          </Link>
          <Link to="/admin" style={navLinkStyle(location.pathname === '/admin')}>
            ⚙️ 관리자 페이지
          </Link>
          <Link to="/mypage" style={navLinkStyle(location.pathname === '/mypage')}>
            👤 마이페이지
          </Link>
        </nav>
      </div>

      {/* 2. 오른쪽 메인 콘텐츠 영역 */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '40px', backgroundColor: '#eae4dc'}}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/inventory-log" element={<InventoryLogPage />} />
          {/* 👇 3. 라우터 경로 매핑 추가 */}
          <Route path="/delivery-schedule" element={<DeliverySchedulePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/oauth/naver" element={<Mypage />} />
          <Route path="/oauth/kakao" element={<Mypage />} />
        </Routes>
      </div>
    </div>
  );
}

const navLinkStyle = (isActive: boolean) => ({
  padding: '12px 15px',
  borderRadius: '6px',
  color: isActive ? '#fff' : '#bcaaa4',
  backgroundColor: isActive ? '#5d4037' : 'transparent',
  textDecoration: 'none',
  fontWeight: 'bold' as 'bold',
  fontSize: '14px',
  transition: '0.2s'
});

export default App;