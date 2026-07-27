import React, { useState } from 'react';
import './AdminPage.css'; // CSS 파일 임포트 (경로는 프로젝트 구조에 맞게 확인해주세요)

export default function AdminPage() {
  // 👥 회원 권한 관리 상태 샘플
  const [users, setUsers] = useState([
    { id: 1, name: '조우진', branch: '부산 본사 물류센터2지점', role: '통괄 관리자', status: '승인됨' },
    { id: 2, name: '김철수', branch: '서울 강남지점', role: '일반 직원', status: '대기 중' },
    { id: 3, name: '박영희', branch: '대구 동성로지점', role: '지점장', status: '승인됨' },
  ]);

  // 📢 시스템 공지사항 입력 상태
  const [notice, setNotice] = useState('');
  const [notices, setNotices] = useState([
    { id: 1, text: '[점검] 2026년 상반기 물류 DB 정기 점검 안내 (06/15)', date: '2026-06-01' },
  ]);

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
            <div key={n.id} className="notice-item">
              <span>{n.text}</span>
              <span className="notice-date">{n.date}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}