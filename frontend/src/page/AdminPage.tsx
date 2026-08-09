import  { useState, useEffect } from 'react';
import './AdminPage.css';

interface User {
  id: number;
  email: string;   
  name: string;
  branch: string;
  role: string;
  status: '승인완료' | '대기중' | '승인거절';
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const currentUser = JSON.parse(savedUser);
        if (!currentUser.role || currentUser.role.toUpperCase() !== 'ADMIN') {
          alert('관리자만 접근할 수 있는 페이지입니다.');
          window.location.href = '/mypage'; 
          return;
        }
      } catch (e) {
        alert('유효하지 않은 사용자 정보입니다.');
        window.location.href = '/mypage';
        return;
      }
    } else {
      alert('로그인이 필요합니다.');
      window.location.href = '/mypage';
      return;
    }

    fetchUsersFromDB();
  }, []);

  const fetchUsersFromDB = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users'); 
      
      if (!response.ok) {
        throw new Error('서버에서 사용자 데이터를 불러오지 못했습니다.');
      }
      
      const data: User[] = await response.json();
      const nonAdminUsers = data.filter(
        user => !user.role || user.role.toUpperCase() !== 'ADMIN'
      );
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('API 연동 오류:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: '승인완료' })
      });

      if (!response.ok) throw new Error('승인 처리에 실패했습니다.');

      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, status: '승인완료' };
        }
        return user;
      }));
      alert('사용자 가입이 승인되었습니다.');
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleRevoke = async (userId: number) => {
    if (window.confirm('정말 해당 사용자의 권한을 해제(승인 거절)하시겠습니까?')) {
      try {
        const response = await fetch(`/api/users/${userId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: '승인거절' })
        });

        if (!response.ok) throw new Error('상태 변경에 실패했습니다.');

        setUsers(users.map(user => {
          if (user.id === userId) {
            return { ...user, status: '승인거절' };
          }
          return user;
        }));
      } catch (error) {
        alert('처리 중 오류가 발생했습니다.');
      }
    }
  };

  const totalBranches = new Set(users.map(u => u.branch).filter(Boolean)).size;
  const pendingCount = users.filter(u => u.status === '대기중').length;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>⚙️ 관리자 페이지</h2>
        <p>시스템 관리와 사용자 권한, 공지사항을 통괄 제어할 수 있는 공간입니다.</p>
      </div>

      <div className="admin-stats-row">
        <div className="stat-card">
          <span className="stat-label">현재 등록 지점</span>
          <span className="stat-value">{totalBranches}개 지점</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">가입 승인 대기</span>
          <span className="stat-value highlight">{pendingCount}명</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">시스템 보안 등급</span>
          <span className="stat-value safe">LEVEL 1 (안전)</span>
        </div>
      </div>

      <div className="card-box" style={{ marginTop: '20px' }}>
        <h3 className="section-title">👥 시스템 사용자 권한 관리</h3>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>이메일</th>
                <th>소속 지점</th>
                <th>부여 권한</th>
                <th className="td-center">상태</th>
                <th className="td-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>데이터를 불러오는 중입니다...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>표시할 일반 사용자 계정이 없습니다.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 'bold' }}>{user.email || '이메일 없음'}</td>
                    <td>{user.branch || '소속 없음'}</td>
                    <td>{user.role || '일반 사용자'}</td>
                    <td className="td-center">
                      <span className={`status-badge ${
                        user.status === '대기중' ? 'pending' : 
                        user.status === '승인거절' ? 'rejected' : 'approved'
                      }`}>
                        {user.status || '승인완료'}
                      </span>
                    </td>
                    <td className="td-center">
                      {user.status === '대기중' || user.status === '승인거절' ? (
                        <button 
                          onClick={() => handleApprove(user.id)}
                          style={{ background: '#4caf50', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          승인하기
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRevoke(user.id)}
                          style={{ background: '#fff5f5', color: '#e53935', border: '1px solid #ffcdd2', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          권한 해제
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}