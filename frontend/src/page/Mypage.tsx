import React, { useState, useEffect } from 'react';
import './Mypage.css';
import axios from 'axios';

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
  const [accessTime, setAccessTime] = useState('');

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'personal' | 'corporate'>('personal');
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', branch: '', email: '', password: '', phone: '' });

  const GOOGLE_CLIENT_ID = "246651152448-cb2g8rpnbqe0uqf31rsn41hro0i9s6uf.apps.googleusercontent.com";
  const NAVER_CLIENT_ID = "cB7Y4lkrJpznEMXohAYQ";
  const NAVER_REDIRECT_URI = "http://localhost:5173/oauth/naver";

  const KAKAO_CLIENT_KEY = "a117eeed609d18d0c44765b0a480d6aa";
  const KAKAO_REDIRECT_URI = "http://localhost:5173/oauth/kakao";

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const path = window.location.pathname;

    if (code) {
      if (path.includes('/oauth/naver')) {
        handleNaverCallback(code);
      } else if (path.includes('/oauth/kakao')) {
        handleKakaoCallback(code);
      }
    }

    const now = new Date();
    setAccessTime(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const tokenPayload = parseJwt(response.credential);
      const socialData = { email: tokenPayload.email, name: tokenPayload.email, provider: 'google', phone: '' };

      const res = await axios.post('/api/users/social-login', socialData);
      setUserInfo(prev => ({ ...prev, name: res.data.email, email: res.data.email }));
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      alert(`환영합니다, ${res.data.email}님! 구글 계정으로 로그인되었습니다.`);
    } catch (error: any) {
      console.error('구글 로그인 연동 실패:', error);
      alert(error.response?.data || '구글 로그인에 실패했습니다.');
    }
  };

  const handleNaverCallback = async (code: string) => {
    try {
      const res = await axios.post('/api/users/naver-login', { code });
      setUserInfo(prev => ({ ...prev, name: res.data.email, email: res.data.email }));
      setIsLoggedIn(true);
      alert(`환영합니다, ${res.data.email}님! 네이버 계정으로 로그인되었습니다.`);
      window.history.replaceState({}, document.title, "/mypage");
    } catch (e: any) {
      console.error('네이버 로그인 처리 실패', e);
      alert(e.response?.data || '네이버 로그인에 실패했습니다.');
    }
  };

  const handleKakaoCallback = async (code: string) => {
    try {
      const res = await axios.post('/api/users/kakao-login', { code });
      setUserInfo(prev => ({ ...prev, name: res.data.email, email: res.data.email }));
      setIsLoggedIn(true);
      alert(`환영합니다, ${res.data.email}님! 카카오 계정으로 로그인되었습니다.`);
      window.history.replaceState({}, document.title, "/mypage");
    } catch (e: any) {
      console.error('카카오 로그인 처리 실패', e);
      alert(e.response?.data || '카카오 로그인에 실패했습니다.');
    }
  };

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  };

  const triggerGoogleLogin = () => {
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: (tokenResponse: any) => {
          if (tokenResponse?.access_token) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
              .then(res => res.json())
              .then(async (data) => {
                try {
                  const res = await axios.post('/api/users/social-login', {
                    email: data.email, name: data.email, provider: 'google', phone: ''
                  });
                  setUserInfo(prev => ({ ...prev, name: res.data.email, email: res.data.email }));
                  setIsLoggedIn(true);
                  setIsLoginModalOpen(false);
                  alert(`환영합니다, ${res.data.email}님!`);
                } catch (err: any) {
                  alert(err.response?.data || '구글 로그인 처리 중 오류가 발생했습니다.');
                }
              });
          }
        },
      });
      client.requestAccessToken();
    }
  };

  const triggerNaverLogin = () => {
    const state = Math.random().toString(36).substring(2);
    window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${state}`;
  };

  const triggerKakaoLogin = () => {
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_KEY}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', {
        email: loginForm.id,
        password: loginForm.password
      });

      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));

      setUserInfo({
        name: userData.name,
        role: userData.role || '일반 사용자',
        branch: userData.branch || '지점 정보 없음',
        email: userData.email,
        phone: userData.phone || '',
      });
      
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      alert('성공적으로 로그인되었습니다.');
      window.location.reload();

    } catch (error: any) {
      console.error('로그인 실패:', error);
      const errorMessage = error.response?.data || '아이디 또는 비밀번호가 일치하지 않습니다.';
      alert(errorMessage);
    }
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
    alert('회원 정보가 수정되었습니다.');
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'password') {
      const filteredPassword = value.replace(/[^A-Za-z0-9~!@#$%^&*()_+|<>?:{}]/g, '');
      setSignupForm({ ...signupForm, [name]: filteredPassword });
    } else if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setSignupForm({ ...signupForm, [name]: formattedPhone });
    } else {
      setSignupForm({ ...signupForm, [name]: value });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameRegex = /^[가-힣]{3,}$/;
    if (!nameRegex.test(signupForm.name)) {
      alert('이름은 한글 3글자 이상이어야 합니다.');
      return;
    }

    try {
      await axios.post('/api/users/signup', signupForm);
      alert('회원가입이 완료되었습니다.');
      setIsSignupModalOpen(false);
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      alert(error.response?.data || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2 className="mypage-title">👤 마이 페이지</h2>
        <p className="mypage-subtitle">계정 정보 및 지점 관리 권한 설정을 관리할 수 있습니다.</p>
      </div>

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
            <button onClick={() => setIsSignupModalOpen(true)} className="signup-button">📝 회원가입</button>
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
            <div>
              <label className="form-group-label">이름</label>
              <input type="text" value={tempInfo.name} onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-group-label">소속 지점</label>
              <input type="text" value={tempInfo.branch} onChange={(e) => setTempInfo({ ...tempInfo, branch: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-group-label">이메일</label>
              <input type="email" value={tempInfo.email} onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-group-label">연락처</label>
              <input type="text" value={tempInfo.phone} onChange={(e) => setTempInfo({ ...tempInfo, phone: e.target.value })} className="form-input" />
            </div>
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
            <div className="info-footer-wrap">
              <button onClick={() => { setTempInfo(userInfo); setIsEditing(true); }} className="submit-button">✏️ 정보 수정하기</button>
            </div>
          </div>
        )}
      </div>

      <div className="card security-card-margin">
        <div className="security-title-wrap">
          <h4 className="section-title security-title-reset">🔒 최근 활동</h4>
        </div>
        <div className="security-box">
          <span>최근 접속 일시: <strong>{accessTime}</strong> (부산 본사 IP)</span>
          <span className="security-badge">안전</span>
        </div>
      </div>

      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content login-modal-width">
            <div className="modal-close-wrap">
              <button onClick={() => setIsLoginModalOpen(false)} className="modal-close-btn">✕</button>
            </div>
            <div className="modal-header-wrap">
              <span className="modal-top-subtitle">카페 물류 시스템의 모든 것</span>
              <h3 className="modal-top-title">☕ CAFE LOGISTICS ERP</h3>
            </div>
            <div className="login-tabs-wrap">
              <button type="button" onClick={() => setLoginTab('personal')} className={loginTab === 'personal' ? 'login-tab-btn-active' : 'login-tab-btn-inactive'}>일반 사용자</button>
              <button type="button" onClick={() => setLoginTab('corporate')} className={loginTab === 'corporate' ? 'login-tab-btn-active' : 'login-tab-btn-inactive'}>지점 관리자</button>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-form-layout">
              <input type="text" placeholder="통합 ID 또는 이메일 입력" value={loginForm.id} onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} className="form-input" />
              <input type="password" placeholder="비밀번호 입력" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="form-input" />
              <button type="submit" className="login-submit-button">로그인</button>
            </form>
            <div className="oauth-section-wrap">
              <span className="oauth-section-label">간편 소셜 로그인</span>
              <div className="oauth-buttons-wrap">
                <button onClick={triggerGoogleLogin} className="oauth-btn-google">구글 로그인</button>
                <button onClick={triggerNaverLogin} className="oauth-btn-naver">네이버</button>
                <button onClick={triggerKakaoLogin} className="oauth-btn-kakao">카카오</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSignupModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="signup-modal-header">
              <h3 className="signup-modal-title">📝 신규 계정 회원가입</h3>
              <button onClick={() => setIsSignupModalOpen(false)} className="modal-close-btn">✕</button>
            </div>
            <form onSubmit={handleSignupSubmit} className="signup-form-layout">
              <input 
                type="text" 
                name="name"
                placeholder="이름 (한글 3글자 이상)" 
                value={signupForm.name} 
                onChange={handleSignupChange} 
                className="form-input" 
              />
              <input 
                type="text" 
                name="branch"
                placeholder="소속 지점" 
                value={signupForm.branch} 
                onChange={handleSignupChange} 
                className="form-input" 
              />
              <input 
                type="email" 
                name="email"
                placeholder="이메일" 
                value={signupForm.email} 
                onChange={handleSignupChange} 
                className="form-input" 
              />
              <input 
                type="password" 
                name="password"
                placeholder="비밀번호 (영문, 숫자, 특수기호)" 
                value={signupForm.password} 
                onChange={handleSignupChange} 
                className="form-input" 
              />
              <input 
                type="text" 
                name="phone"
                placeholder="연락처 (자동 하이픈)" 
                value={signupForm.phone} 
                onChange={handleSignupChange} 
                maxLength={13}
                className="form-input" 
              />
              <button type="submit" className="submit-button signup-submit-margin">가입 신청</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}