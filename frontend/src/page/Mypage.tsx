import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    branch: '',
    email: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState(userInfo);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [accessTime, setAccessTime] = useState('');

  // 15번: 알림 수신 설정 상태
  const [notifications, setNotifications] = useState({
    notice: true,
    schedule: false,
  });

  // 13번: 내가 쓴 글 / 댓글 실시간 연동 데이터 상태
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [isFindModalOpen, setIsFindModalOpen] = useState(false);
  const [findType, setFindType] = useState<'id' | 'pw'>('id');
  const [findForm, setFindForm] = useState({ name: '', phone: '', email: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [findResult, setFindResult] = useState('');

  const [loginTab, setLoginTab] = useState<'personal' | 'corporate'>('personal');
  const [loginForm, setLoginForm] = useState({ id: '', password: '', adminCode: '' });
  const [signupForm, setSignupForm] = useState({ name: '', branch: '', email: '', password: '', phone: '' });

  const GOOGLE_CLIENT_ID = "246651152448-cb2g8rpnbqe0uqf31rsn41hro0i9s6uf.apps.googleusercontent.com";
  const NAVER_CLIENT_ID = "cB7Y4lkrJpznEMXohAYQ";
  const NAVER_REDIRECT_URI = `${window.location.origin}/oauth/naver`;
  const KAKAO_CLIENT_KEY = "a117eeed609d18d0c44765b0a480d6aa";
  const KAKAO_REDIRECT_URI = `${window.location.origin}/oauth/kakao`;

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserInfo({
          name: userData.name || '사용자',
          role: userData.role || '일반 사용자',
          branch: userData.branch || '지점 정보 없음',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        setIsLoggedIn(true);
        // 🟢 13번: 로그인된 유저의 이메일을 기반으로 실제 백엔드 활동 내역(글/댓글) 조회
        fetchMyActivityData(userData.email);
      } catch (e) {
        console.error('사용자 세션 파싱 실패', e);
        localStorage.removeItem('user');
      }
    }

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

  // 🟢 13번: 실제 백엔드 API와 연동하여 사용자가 작성한 글 및 댓글을 가져오는 함수
  const fetchMyActivityData = async (email: string) => {
    if (!email) return;
    try {
      const res = await axios.get(`/api/users/me/activities?email=${encodeURIComponent(email)}`);
      // 백엔드 응답 구조에 맞게 설정 (예: res.data.posts, res.data.comments)
      if (res.data) {
        setMyPosts(res.data.posts || []);
        setMyComments(res.data.comments || []);
      }
    } catch (e) {
      console.error('실시간 활동 내역 조회 실패:', e);
      // API가 아직 백엔드에 구현되지 않았을 경우를 대비한 안전 장치 (필요시 빈 배열 유지)
      setMyPosts([]);
      setMyComments([]);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const tokenPayload = parseJwt(response.credential);
      const socialData = { email: tokenPayload.email, name: tokenPayload.email, provider: 'google', phone: '' };

      const res = await axios.post('/api/users/social-login', socialData);
      const userData = res.data;
      
      localStorage.setItem('user', JSON.stringify(userData));

      setUserInfo({
        name: userData.name || userData.email,
        role: userData.role || '일반 사용자',
        branch: userData.branch || '지점 정보 없음',
        email: userData.email,
        phone: userData.phone || '',
      });
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      fetchMyActivityData(userData.email); // 로그인 직후 활동 내역 갱신
      alert(`환영합니다, ${userData.email}님! 구글 계정으로 로그인되었습니다.`);
    } catch (error: any) {
      console.error('구글 로그인 연동 실패:', error);
      alert(error.response?.data || '구글 로그인에 실패했습니다.');
    }
  };

  const handleNaverCallback = async (code: string) => {
    try {
      const res = await axios.post('/api/users/naver-login', { code });
      const userData = res.data;

      localStorage.setItem('user', JSON.stringify(userData));

      setUserInfo({
        name: userData.name || userData.email,
        role: userData.role || '일반 사용자',
        branch: userData.branch || '지점 정보 없음',
        email: userData.email,
        phone: userData.phone || '',
      });
      setIsLoggedIn(true);
      fetchMyActivityData(userData.email);
      alert(`환영합니다, ${userData.email}님! 네이버 계정으로 로그인되었습니다.`);
      window.history.replaceState({}, document.title, "/mypage");
    } catch (e: any) {
      console.error('네이버 로그인 처리 실패', e);
      alert(e.response?.data || '네이버 로그인에 실패했습니다.');
    }
  };

  const handleKakaoCallback = async (code: string) => {
    try {
      const res = await axios.post('/api/users/kakao-login', { code });
      const userData = res.data;

      localStorage.setItem('user', JSON.stringify(userData));

      setUserInfo({
        name: userData.name || userData.email,
        role: userData.role || '일반 사용자',
        branch: userData.branch || '지점 정보 없음',
        email: userData.email,
        phone: userData.phone || '',
      });
      setIsLoggedIn(true);
      fetchMyActivityData(userData.email);
      alert(`환영합니다, ${userData.email}님! 카카오 계정으로 로그인되었습니다.`);
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
                    email: data.email, name: data.name || data.email, provider: 'google', phone: ''
                  });
                  const userData = res.data;

                  localStorage.setItem('user', JSON.stringify(userData));

                  setUserInfo({
                    name: userData.name || userData.email,
                    role: userData.role || '일반 사용자',
                    branch: userData.branch || '지점 정보 없음',
                    email: userData.email,
                    phone: userData.phone || '',
                  });
                  setIsLoggedIn(true);
                  setIsLoginModalOpen(false);
                  fetchMyActivityData(userData.email);
                  alert(`환영합니다, ${userData.email}님!`);
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
      if (loginTab === 'corporate') {
        const codeRegex = /^\d{4}$/;
        if (!codeRegex.test(loginForm.adminCode)) {
          alert("관리자 코드는 반드시 숫자 4자리여야 합니다. (ex: 7328)");
          return;
        }

        const response = await axios.post('/api/users/login/admin', {
          email: loginForm.id,
          password: loginForm.password,
          adminCode: loginForm.adminCode
        });

        const userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        setUserInfo({
          name: userData.name || '통합 관리자',
          role: userData.role || '통괄 관리자 / 물류팀',
          branch: userData.branch || '부산 본사 물류센터2지점',
          email: userData.email,
          phone: userData.phone || '010-1234-5679',
        });

        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        fetchMyActivityData(userData.email);
        alert('관리자로 성공적으로 로그인되었습니다.');

      } else {
        const response = await axios.post('/api/users/login', {
          email: loginForm.id,
          password: loginForm.password
        });

        const userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        setUserInfo({
          name: userData.name || '사용자',
          role: userData.role || '일반 사용자',
          branch: userData.branch || '지점 정보 없음',
          email: userData.email,
          phone: userData.phone || '',
        });
        
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        fetchMyActivityData(userData.email);
        alert('성공적으로 로그인되었습니다.');
      }

    } catch (error: any) {
      console.error('로그인 실패:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || '아이디 또는 비밀번호가 일치하지 않습니다.';
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
      setIsLoggedIn(false);
      setIsDetailOpen(false);
      localStorage.removeItem('user');
      alert('로그아웃 되었습니다.');
    }
  };

  const handleWithdrawal = async () => {
    if (confirm('⚠️ 정말 회원탈퇴를 진행하시겠습니까?\n탈퇴 시 계정은 비활성화되며 동일한 이메일로 다시 로그인할 수 없습니다.')) {
      try {
        await axios.delete(`/api/users/me?email=${encodeURIComponent(userInfo.email)}`);
        alert('회원탈퇴가 정상적으로 처리되었습니다.');
        setIsLoggedIn(false);
        setIsDetailOpen(false);
        localStorage.removeItem('user');
        navigate('/');
      } catch (e: any) {
        console.error('회원탈퇴 실패:', e);
        alert(e.response?.data || '회원탈퇴 처리에 실패했습니다.');
      }
    }
  };

  const handleSave = () => {
    setUserInfo(tempInfo);
    setIsEditing(false);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const updatedUser = { ...userData, ...tempInfo };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
      }
    }

    alert('회원 정보가 수정되었습니다.');
  };

  const handleNotificationToggle = (key: 'notice' | 'schedule') => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      const label = key === 'notice' ? '지점 공지사항 알림' : '배송 스케줄 변동 알림';
      alert(`${label} 설정이 [${updated[key] ? 'ON' : 'OFF'}]로 변경되었습니다.`);
      return updated;
    });
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    else if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    else return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(signupForm.email)) {
      alert('올바른 이메일 형식을 입력해주세요. (예: id@naver.com)');
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

  const handleFindSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (findType === 'id') {
        if (!isCodeSent) {
          const res = await axios.post('/api/users/send-verification', {
            name: findForm.name,
            email: findForm.email
          });
          setIsCodeSent(true);
          setFindResult(res.data || '입력하신 이메일로 인증번호가 전송되었습니다.');
        } else {
          const res = await axios.post('/api/users/verify-and-find-id', {
            name: findForm.name,
            email: findForm.email,
            code: verificationCode
          });
          const email = typeof res.data === 'string' ? res.data : (res.data.email || res.data.message);
          setFindResult(`🎉 찾은 아이디(이메일): ${email}`);
        }
      } else {
        const res = await axios.post('/api/users/reset-password', {
          name: findForm.name,
          email: findForm.email
        });
        const message = typeof res.data === 'string' ? res.data : (res.data.message || '임시 비밀번호가 발급되었습니다.');
        setFindResult(message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data || '요청 처리에 실패했습니다.';
      alert(typeof errorMsg === 'string' ? errorMsg : '다시 시도해 주세요.');
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
          {isLoggedIn ? (
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
          ) : (
            <div className="profile-info-wrap">
              <div>
                <span className="modal-top-subtitle">카페 물류 시스템의 모든 것</span>
                <h3 className="profile-name profile-name-guest">☕ CAFE LOGISTICS ERP</h3>
              </div>
            </div>
          )}

          <div className="action-buttons-wrap">
            <button onClick={() => setIsSignupModalOpen(true)} className="signup-button">📝 회원가입</button>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="auth-button-logout">🚪 Log Out</button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="auth-button-login">🔑 Log In</button>
            )}
          </div>
        </div>

        {isLoggedIn && (
          <>
            <h4 
              className="section-title section-title-toggle" 
              onClick={() => setIsDetailOpen(!isDetailOpen)} 
            >
              <span>{isDetailOpen ? '▼' : '▶'}</span> 📋 상세 계정 정보
            </h4>

            {isDetailOpen && (
              isEditing ? (
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
              )
            )}
          </>
        )}
      </div>

      {!isLoggedIn ? (
        <>
          <div className="card">
            <h4 className="section-title">✨ CAFE LOGISTICS 주요 서비스</h4>
            <div className="service-grid">
              <div className="service-card">
                <div className="service-icon">📦</div>
                <div className="service-title">실시간 재고 관리</div>
                <div className="service-desc">원두, 부자재 입출고 및 보유 수량 즉시 조회</div>
              </div>
              <div className="service-card">
                <div className="service-icon">🗺️</div>
                <div className="service-title">지점 위치 현황</div>
                <div className="service-desc">카카오 맵 연동 지점 정보 및 로드뷰 탐색</div>
              </div>
              <div className="service-card">
                <div className="service-icon">📢</div>
                <div className="service-title">통합 소통 게시판</div>
                <div className="service-desc">본사 공지사항 및 지점 간 요청사항 관리</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="section-title">💡 이용 안내 & 지원 서비스</h4>
            <div className="info-row">
              <span className="info-label">시스템 운영 시간</span>
              <span className="info-value">365일 24시간 클라우드 상시 가동 (Vercel & Railway)</span>
            </div>
            <div className="info-row">
              <span className="info-label">개발자 및 시스템 문의</span>
              <span className="info-value">whdnwlszzz@naver.com (조우진)</span>
            </div>
            <div className="info-row-last">
              <span className="info-label">부산 본사 물류 지원센터</span>
              <span className="info-value">051-987-6543 (평일 09:00 ~ 18:00)</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h4 className="section-title">🚀 빠른 바로가기 및 업무 메뉴</h4>
            <div className="quick-menu-grid">
              <button onClick={() => navigate('/')} className="quick-menu-btn">
                📦 재고 관리 대시보드로 이동
              </button>
              <button onClick={() => navigate('/community')} className="quick-menu-btn">
                📢 커뮤니티 게시판 바로가기
              </button>
            </div>
          </div>

          <div className="card">
            <h4 className="section-title">📊 지점 운영 상태 요약</h4>
            <div className="info-row"><span className="info-label">현재 접속 지점</span><span className="info-value">{userInfo.branch || '본사 물류센터'}</span></div>
            <div className="info-row"><span className="info-label">담당 업무 권한</span><span className="info-value">{userInfo.role}</span></div>
            <div className="info-row-last"><span className="info-label">시스템 상태</span><span className="info-value status-online">정상 가동 중 (ONLINE)</span></div>
          </div>

          {/* 알림 및 공지 수신 설정 카드 */}
          <div className="card">
            <h4 className="section-title">🔔 알림 및 공지 수신 설정</h4>
            <div className="info-row notification-row">
              <span className="info-label">새로운 지점 공지사항 알림 받기</span>
              <button
                type="button"
                onClick={() => handleNotificationToggle('notice')}
                className={notifications.notice ? 'toggle-btn-on' : 'toggle-btn-off'}
              >
                {notifications.notice ? 'ON (수신중)' : 'OFF (차단)'}
              </button>
            </div>
            <div className="info-row-last notification-row">
              <span className="info-label">배송 스케줄 및 입출고 변동 알림</span>
              <button
                type="button"
                onClick={() => handleNotificationToggle('schedule')}
                className={notifications.schedule ? 'toggle-btn-on' : 'toggle-btn-off'}
              >
                {notifications.schedule ? 'ON (수신중)' : 'OFF (차단)'}
              </button>
            </div>
          </div>

          {/* 🟢 13번: 내 활동 내역 실시간 연동 리스트 카드 */}
          <div className="card">
            <h4 className="section-title">📋 내 활동 내역 요약 (실시간 연동)</h4>
            <div className="activity-tabs-wrap">
              <button 
                type="button"
                onClick={() => setActiveTab('posts')} 
                className={activeTab === 'posts' ? 'activity-tab-btn-active' : 'activity-tab-btn-inactive'}
              >
                내가 쓴 게시글 ({myPosts.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('comments')} 
                className={activeTab === 'comments' ? 'activity-tab-btn-active' : 'activity-tab-btn-inactive'}
              >
                내가 쓴 댓글 ({myComments.length})
              </button>
            </div>

            <div className="activity-list-box">
              {activeTab === 'posts' ? (
                myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <div key={post.id} className="activity-item" onClick={() => navigate('/community')}>
                      <span className="activity-item-title">📄 {post.title}</span>
                      <span className="activity-item-date">{post.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="activity-empty">작성한 게시글이 없습니다.</p>
                )
              ) : (
                myComments.length > 0 ? (
                  myComments.map((comment) => (
                    <div key={comment.id} className="activity-item" onClick={() => navigate('/community')}>
                      <span className="activity-item-title">💬 {comment.content} <small style={{color: '#8d6e63'}}>({comment.postTitle})</small></span>
                      <span className="activity-item-date">{comment.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="activity-empty">작성한 댓글이 없습니다.</p>
                )
              )}
            </div>
          </div>
        </>
      )}

      <div className="card security-card-margin">
        <div className="security-title-wrap">
          <h4 className="section-title security-title-reset">🔒 최근 활동</h4>
        </div>
        <div className="security-box">
          <span>최근 접속 일시: <strong>{accessTime}</strong> (부산 본사 IP)</span>
          <span className="security-badge">안전</span>
        </div>

        {isLoggedIn && (
          <div className="withdrawal-area" style={{ marginTop: '15px' }}>
            <button type="button" onClick={handleWithdrawal} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
              ⚠️ 영구 회원 탈퇴하기
            </button>
          </div>
        )}
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
              <input type="text" placeholder={loginTab === 'corporate' ? "관리자 이메일 (dnwls00@admin.com)" : "통합 ID 또는 이메일 입력"} value={loginForm.id} onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })} className="form-input" />
              <input type="password" placeholder="비밀번호 입력" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="form-input" />
              
              {loginTab === 'corporate' && (
                <input type="password" maxLength={4} placeholder="관리자 코드 숫자 4자리 입력 (ex: 7328)" value={loginForm.adminCode} onChange={(e) => setLoginForm({ ...loginForm, adminCode: e.target.value })} className="form-input" />
              )}

              <button type="submit" className="login-submit-button">로그인</button>
            </form>

            <div className="find-credentials-wrap">
              <span className="find-link" onClick={() => { setFindType('id'); setIsFindModalOpen(true); setIsCodeSent(false); setVerificationCode(''); setFindResult(''); }}>
                아이디 찾기
              </span>
              <span className="find-divider">|</span>
              <span className="find-link" onClick={() => { setFindType('pw'); setIsFindModalOpen(true); setIsCodeSent(false); setVerificationCode(''); setFindResult(''); }}>
                비밀번호 찾기
              </span>
            </div>

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

      {/* 아이디/비밀번호 찾기 모달 */}
      {isFindModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="signup-modal-header">
              <h3 className="signup-modal-title">
                {findType === 'id' ? '🔍 아이디 찾기 (이메일 인증)' : '🔑 비밀번호 찾기'}
              </h3>
              <button onClick={() => { setIsFindModalOpen(false); setIsCodeSent(false); setVerificationCode(''); }} className="modal-close-btn">✕</button>
            </div>
            
            <form onSubmit={handleFindSubmit} className="signup-form-layout">
              <input 
                type="text" 
                placeholder="이름 입력" 
                value={findForm.name} 
                onChange={(e) => setFindForm({ ...findForm, name: e.target.value })} 
                className="form-input" 
                disabled={isCodeSent && findType === 'id'} 
                required
              />
              <input 
                type="email" 
                placeholder="가입한 이메일 입력" 
                value={findForm.email} 
                onChange={(e) => setFindForm({ ...findForm, email: e.target.value })} 
                className="form-input" 
                disabled={isCodeSent && findType === 'id'} 
                required
              />

              {isCodeSent && findType === 'id' && (
                <input 
                  type="text" 
                  placeholder="메일로 받은 인증번호 6자리 입력" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value)} 
                  className="form-input" 
                  required
                />
              )}

              <button type="submit" className="submit-button">
                {findType === 'id' && !isCodeSent ? '인증메일 전송' : '확인'}
              </button>
            </form>

            {findResult && (
              <div className="find-result-box">
                {findResult}
              </div>
            )}
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
              <input type="text" name="name" placeholder="이름 (한글 3글자 이상)" value={signupForm.name} onChange={handleSignupChange} className="form-input" />
              <input type="text" name="branch" placeholder="소속 지점" value={signupForm.branch} onChange={handleSignupChange} className="form-input" />
              <input type="email" name="email" placeholder="이메일 (예: id@naver.com)" value={signupForm.email} onChange={handleSignupChange} className="form-input" />
              <input type="password" name="password" placeholder="비밀번호 (영문, 숫자, 특수기호)" value={signupForm.password} onChange={handleSignupChange} className="form-input" />
              <input type="text" name="phone" placeholder="연락처 (자동 하이픈)" value={signupForm.phone} onChange={handleSignupChange} maxLength={13} className="form-input" />
              <button type="submit" className="submit-button signup-submit-margin">가입 신청</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}