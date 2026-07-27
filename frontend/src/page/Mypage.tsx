import React, { useState, useEffect } from 'react';
import './Mypage.css'; // 👈 CSS 파일 임포트 추가

// 전역 window 객체에 google 타입 선언 (타입스크립트 에러 방지)
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: any;
        id: {
          initialize: (config: { client_id: string; callback: (response: any) => void }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export default function Mypage() {
  const [userInfo, setUserInfo] = useState({
    name: '조우진',
    role: '통괄 관리자 / 물류팀',
    branch: '부산 본사 물류센터2지점',
    email: 'logistics_master@cafelog.com',
    phone: '010-1234-5679',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState(userInfo);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'personal' | 'corporate'>('personal');
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', branch: '', email: '', password: '', phone: '' });

  // 🔑 구글 클라우드 콘솔에서 발급받은 '클라이언트 ID'를 여기에 입력하세요!
  const GOOGLE_CLIENT_ID = "246651152448-cb2g8rpnbqe0uqf31rsn41hro0i9s6uf.apps.googleusercontent.com";

  useEffect(() => {
    // 구글 스크립트 로드 완료 시 초기화
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    }
  }, []);

  // 구글 로그인 성공 후 실행되는 콜백 함수
  const handleGoogleResponse = (response: any) => {
    try {
      const tokenPayload = parseJwt(response.credential);
      
      setUserInfo(prev => ({
        ...prev,
        name: tokenPayload.name,
        email: tokenPayload.email,
      }));
      
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      alert(`환영합니다, ${tokenPayload.name}님! 구글 계정으로 로그인되었습니다.`);
    } catch (error) {
      console.error('구글 로그인 토큰 처리 실패:', error);
      alert('구글 로그인 중 오류가 발생했습니다.');
    }
  };

  // JWT 디코딩 헬퍼 함수
  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  // 구글 로그인 버튼 클릭 시 실행
  const triggerGoogleLogin = () => {
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
                .then(res => res.json())
                .then(data => {
                  setUserInfo(prev => ({
                    ...prev,
                    name: data.name,
                    email: data.email,
                  }));
                  setTempInfo(prev => ({
                    ...prev,
                    name: data.name,
                    email: data.email,
                  }));
                  setIsLoggedIn(true);
                  setIsLoginModalOpen(false);
                  
                  alert(`환영합니다, ${data.name}님! 구글 계정으로 로그인되었습니다.`);
                });
            }
          },
        });
        client.requestAccessToken();
      } catch (e) {
        console.error(e);
        alert('구글 로그인 창을 여는 데 실패했습니다.');
      }
    } else {
      alert('구글 로그인 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 일반 로그인 핸들러
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.id || !loginForm.password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setLoginForm({ id: '', password: '' });
    alert('성공적으로 로그인되었습니다.');
  };

  // 기타 소셜(네이버, 카카오) 연동 예시
  const handleSocialLogin = (provider: string) => {
    alert(`${provider} 로그인은 해당 플랫폼의 개발자 센터 연동 설정이 필요합니다.`);
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      setIsLoggedIn(false);
      alert('로그아웃 되었습니다.');
    }
  };

  const handleSave = () => {
    setUserInfo(tempInfo);
    setIsEditing(false);
    alert('회원 정보가 성공적으로 수정되었습니다.');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    alert(`${signupForm.name}님의 회원가입 신청이 완료되었습니다.`);
    setIsSignupModalOpen(false);
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2 className="mypage-title">👤 마이 페이지</h2>
        <p className="mypage-subtitle">계정 정보 및 지점 관리 권한 설정을 관리할 수 있습니다.</p>
      </div>

      {/* 기본 정보 카드 */}
      <div className="card">
        <div className="card-top-section">
          <div className="profile-info-wrap">
            <div className="profile-avatar">☕</div>
            <div>
              <div className="profile-name-row">
                <h3 className="profile-name">{userInfo.name}</h3>
                <span className="branch-badge">{userInfo.branch}</span>
              </div>
              <p className="profile-role">{userInfo.role}</p>
            </div>
          </div>

          <div className="action-buttons-wrap">
            {/* 👇 회원가입 버튼 바로 위에 '~~님' 표시 및 버튼 묶음 */}
            <div className="signup-column">
              {isLoggedIn && (
                <span className="welcome-user-text">
                  {userInfo.name}님
                </span>
              )}
              <button onClick={() => setIsSignupModalOpen(true)} className="signup-button">📝 회원가입</button>
            </div>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="auth-button-logout">🚪 Log Out</button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="auth-button-login">🔑 Log In</button>
            )}
          </div>
        </div>

        <h4 className="section-title">📋 상세 계정 정보</h4>
        
        {isEditing ? (
          <div className="edit-form-wrap">
            <div><label className="form-group-label">이름</label><input type="text" value={tempInfo.name} onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })} className="form-input" /></div>
            <div><label className="form-group-label">소속 지점</label><input type="text" value={tempInfo.branch} onChange={(e) => setTempInfo({ ...tempInfo, branch: e.target.value })} className="form-input" /></div>
            <div><label className="form-group-label">이메일</label><input type="email" value={tempInfo.email} onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })} className="form-input" /></div>
            <div><label className="form-group-label">연락처</label><input type="text" value={tempInfo.phone} onChange={(e) => setTempInfo({ ...tempInfo, phone: e.target.value })} className="form-input" /></div>
            <div className="form-buttons-wrap">
              <button onClick={() => setIsEditing(false)} className="cancel-button">취소</button>
              <button onClick={handleSave} className="submit-button">저장하기</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="info-row"><span className="info-label">이름</span><span className="info-value">{userInfo.name}</span></div>
            <div className="info-row"><span className="info-label">소속 지점</span><span className="info-value">{userInfo.branch}</span></div>
            <div className="info-row"><span className="info-label">담당 권한</span><span className="info-value">{userInfo.role}</span></div>
            <div className="info-row"><span className="info-label">이메일</span><span className="info-value">{userInfo.email}</span></div>
            <div className="info-row-last"><span className="info-label">연락처</span><span className="info-value">{userInfo.phone}</span></div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
              <button onClick={() => { setTempInfo(userInfo); setIsEditing(true); }} className="submit-button">✏️ 정보 수정하기</button>
            </div>
          </div>
        )}
      </div>

      {/* 🔒 [보안 및 최근 활동 박스] */}
      <div className="card" style={{ marginTop: '25px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h4 className="section-title" style={{ margin: 0 }}>
            🔒 보안 및 최근 활동
          </h4>
        </div>
        <div className="security-box">
          <span>최근 접속 일시: <strong>2026-06-07 13:50:12</strong> (부산 본사 IP)</span>
          <span className="security-badge">안전</span>
        </div>
      </div>

      {/* 🔑 [로그인 모달창] */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
              <button onClick={() => setIsLoginModalOpen(false)} className="modal-close-btn">✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <span style={{ fontSize: '12px', color: '#8d6e63', fontWeight: 'bold' }}>카페 물류 시스템의 모든 것</span>
              <h3 style={{ fontSize: '22px', color: '#3e2723', margin: '5px 0 0 0' }}>☕ CAFE LOGISTICS ERP</h3>
            </div>

            <div className="login-tabs-wrap">
              <button type="button" onClick={() => setLoginTab('personal')} className={loginTab === 'personal' ? 'login-tab-btn-active' : 'login-tab-btn-inactive'}>일반 사용자</button>
              <button type="button" onClick={() => setLoginTab('corporate')} className={loginTab === 'corporate' ? 'login-tab-btn-active' : 'login-tab-btn-inactive'}>지점 관리자</button>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><input type="text" placeholder={loginTab === 'personal' ? '통합 ID 또는 이메일 입력' : '지점 관리자 코드 입력'} value={loginForm.id} onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} className="form-input" /></div>
              <div><input type="password" placeholder="비밀번호 입력" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="form-input" /></div>
              <button type="submit" className="login-submit-button">로그인</button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #efebe9', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#8d6e63', display: 'block', marginBottom: '12px' }}>간편 소셜 로그인</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={triggerGoogleLogin} className="oauth-btn-google">
                  구글 로그인
                </button>
                <button onClick={() => handleSocialLogin('네이버')} className="oauth-btn-naver">
                  네이버
                </button>
                <button onClick={() => handleSocialLogin('카카오')} className="oauth-btn-kakao">
                  카카오
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontSize: '12px', color: '#8d6e63' }}>
              <span style={{ cursor: 'pointer' }}>아이디 찾기</span><span>|</span>
              <span style={{ cursor: 'pointer' }}>비밀번호 찾기</span><span>|</span>
              <span style={{ cursor: 'pointer', color: '#5d4037', fontWeight: 'bold' }} onClick={() => { setIsLoginModalOpen(false); setIsSignupModalOpen(true); }}>회원가입</span>
            </div>
          </div>
        </div>
      )}

      {/* 📝 [회원가입 모달창] */}
      {isSignupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #d7ccc8', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#2c1e1a', fontSize: '18px' }}>📝 신규 계정 회원가입</h3>
              <button onClick={() => setIsSignupModalOpen(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label className="form-group-label">이름</label><input type="text" placeholder="이름을 입력하세요" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className="form-input" /></div>
              <div><label className="form-group-label">소속 지점</label><input type="text" placeholder="예: 부산 본사 물류센터" value={signupForm.branch} onChange={(e) => setSignupForm({ ...signupForm, branch: e.target.value })} className="form-input" /></div>
              <div><label className="form-group-label">이메일</label><input type="email" placeholder="아이디로 사용할 이메일" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="form-input" /></div>
              <div><label className="form-group-label">비밀번호</label><input type="password" placeholder="비밀번호 입력" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="form-input" /></div>
              <div><label className="form-group-label">연락처</label><input type="text" placeholder="010-0000-0000" value={signupForm.phone} onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })} className="form-input" /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsSignupModalOpen(false)} className="cancel-button">취소</button>
                <button type="submit" className="submit-button">가입 신청</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}