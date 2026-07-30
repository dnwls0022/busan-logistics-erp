import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardPage from './page/DashboardPage';
import MapPage from './page/MapPage';
import CommunityPage from './page/CommunityPage';
import AdminPage from './page/AdminPage';
import Mypage from './page/Mypage';
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
          <Link to="/community" style={navLinkStyle(location.pathname === '/community')}>
            💬 커뮤니티
          </Link>
          <Link to="/admin" style={navLinkStyle(location.pathname === '/admin')}>
            ⚙️ 관리자 페이지
          </Link>
          {/* 👇 이 부분을 추가하세요! */}
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
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/mypage" element={<Mypage />} />
          {/* 🟢 이 두 줄을 추가해 주세요! */}
      <Route path="/oauth/naver" element={<Mypage />} />
      <Route path="/oauth/kakao" element={<Mypage />} />
        </Routes>
      </div>
    </div>
  );
}

// 사이드바 링크 스타일 함수
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