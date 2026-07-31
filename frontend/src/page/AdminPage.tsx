import React, { useState, useEffect } from 'react';
import './AdminPage.css';

interface User {
  id: number;
  name: string;
  branch: string;
  role: string;
  status: string;
}

interface Notice {
  id: number;
  text: string;
  date: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // 1. localStorage에서 'user' 데이터 가져오기
    const storedUser = localStorage.getItem('user');
    console.log("🔍 로컬스토리지에 저장된 유저 정보:", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        console.log("👤 파싱된 유저 권한(role):", parsedUser.role);

        // 2. role이 'ADMIN'이거나 '통괄 관리자'인지 확인
        if (parsedUser.role === 'ADMIN' || parsedUser.role === '통괄 관리자') {
          setIsAuthorized(true);
        }
      } catch (e) {
        console.error("유저 정보 파싱 오류:", e);
      }
    }
  }, []);

  // 👥 회원 권한 관리 상태
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: '조우진', branch: '부산 본사 물류센터2지점', role: '통괄 관리자', status: '승인됨' },
    { id: 2, name: '김철수', branch: '서울 강남지점', role: '일반 직원', status: '대기 중' },
    { id: 3, name: '박영희', branch: '대구 동성로지점', role: '지점장', status: '승인됨' },
  ]);

  // 📢 시스템 공지사항 입력 및 목록 상태
  const [notice, setNotice] = useState('');
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, text: '[점검] 2026년 상반기 물류 DB 정기 점검 안내 (06/15)', date: '2026-06-01' },
  ]);

  // 팝업(모달) 제어 상태
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editText, setEditText] = useState('');

  // 권한 승인 토글 핸들러
  const handleToggleStatus = (id: number) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const nextStatus = user.status === '승인됨' ? '대기 중' : '승인됨';
        return { ...user, status: nextStatus };
      }
      return user;
    }));
  };

  // 공지사항 등록 핸들러
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notice.trim()) return;
    setNotices([{ id: Date.now(), text: notice, date: '2026-06-07' }, ...notices]);
    setNotice('');
    alert('시스템 공지사항이 등록되었습니다.');
  };

  // 공지 클릭 시 모달 열기
  const handleOpenModal = (item: Notice) => {
    setSelectedNotice(item);
    setEditText(item.text);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedNotice(null);
    setEditText('');
  };

  // 공지 수정 내용 저장 핸들러
  const handleSaveNotice = () => {
    if (!editText.trim()) return;
    setNotices(notices.map(n => n.id === selectedNotice?.id ? { ...n, text: editText } : n));
    alert('공지사항이 수정되었습니다.');
    handleCloseModal();
  };

  // 🗑️ 공지사항 삭제 핸들러
  const handleDeleteNotice = () => {
    if (!selectedNotice) return;
    if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      setNotices(notices.filter(n => n.id !== selectedNotice.id));
      alert('공지사항이 삭제되었습니다.');
      handleCloseModal();
    }
  };

  // 🚫 로그인하지 않았거나 권한이 없는 경우 보여줄 차단 화면
  if (!currentUser || !isAuthorized) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#d9534f', fontSize: '24px', marginBottom: '10px' }}>🚫 접근 권한이 없습니다.</h2>
        <p style={{ color: '#666', fontSize: '15px' }}>
          {!currentUser ? '로그인 후 이용해주세요. (localStorage에 user 정보 없음)' : `현재 계정 권한("${currentUser.role}")은 관리자 전용 페이지에 접근할 수 없습니다.`}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      
      {/* 상단 타이틀 */}
      <div className="admin-header">
        <h2 className="admin-title">
          ⚙️ 관리자 페이지
        </h2>
        <p className="admin-subtitle">시스템 관리와 사용자 권한, 공지사항을 통괄 제어할 수 있는 공간입니다.</p>
      </div>

      {/* 📊 상단 지표 요약 카드 섹션 */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">전체 등록 지점</span>
          <h3 className="stat-value-normal">24개 지점</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">가입 승인 대기</span>
          <h3 className="stat-value-danger">1명</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">시스템 보안 등급</span>
          <h3 className="stat-value-success">LEVEL 1 (안전)</h3>
        </div>
      </div>

      {/* 👥 사용자 및 권한 관리 테이블 섹션 */}
      <div className="card-box">
        <h4 className="section-title">👥 지점별 사용자 권한 관리</h4>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>소속 지점</th>
              <th>부여 권한</th>
              <th>상태</th>
              <th style={{ textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isApproved = u.status === '승인됨';
              return (
                <tr key={u.id}>
                  <td className="user-name">{u.name}</td>
                  <td className="user-branch">{u.branch}</td>
                  <td className="user-role">{u.role}</td>
                  <td>
                    <span className={`status-badge ${isApproved ? 'approved' : 'pending'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleToggleStatus(u.id)}
                      className={`action-btn ${isApproved ? 'approved' : 'pending'}`}
                    >
                      {isApproved ? '권한 해제' : '승인하기'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📢 시스템 공지사항 등록 섹션 */}
      <div className="card-box mt-25">
        <h4 className="section-title mb-15">📢 전사 시스템 공지 등록</h4>
        
        <form onSubmit={handleAddNotice} className="notice-form">
          <input 
            type="text" 
            placeholder="전체 지점에 전파할 공지사항 내용을 입력하세요..." 
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="notice-input"
          />
          <button type="submit" className="notice-submit-btn">등록하기</button>
        </form>

        <div className="notice-list">
          {notices.map((n) => (
            <div 
              key={n.id} 
              className="notice-item clickable" 
              onClick={() => handleOpenModal(n)}
            >
              <span>{n.text}</span>
              <span className="notice-date">{n.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 팝업 모달: 공지사항 상세 조회, 수정 및 삭제 */}
      {selectedNotice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header-wrap">
              <span className="modal-top-subtitle">공지사항 관리</span>
              <h3 className="modal-top-title">공지 상세 및 수정</h3>
            </div>
            
            <div className="edit-form-wrap">
              <label className="form-group-label">등록일자: {selectedNotice.date}</label>
              <textarea 
                className="modal-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
              />
            </div>

            {/* 하단 버튼 영역 */}
            <div className="form-buttons-wrap" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                onClick={handleDeleteNotice} 
                style={{ backgroundColor: '#d9534f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                삭제하기
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="cancel-button" onClick={handleCloseModal}>취소</button>
                <button type="button" className="submit-button" onClick={handleSaveNotice}>수정완료</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}