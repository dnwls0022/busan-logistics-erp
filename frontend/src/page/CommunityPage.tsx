import React, { useState } from 'react';
import './CommunityPage.css'; // CSS 파일 임포트 (경로는 프로젝트 구조에 맞게 확인해주세요)

// 게시글 데이터 타입 정의
interface Post {
  id: number;
  title: string;
  author: string;
  branch: string;
  date: string;
  views: number;
  content: string;
}

export default function CommunityPage() {
  // 더미 게시글 리스트 (나중에 백엔드 API와 연결하기 좋습니다)
  const [posts, setPosts] = useState<Post[]>([
    { id: 3, title: '부산 서면점 원두 재고 부족 관련 공유합니다.', author: '김지점', branch: '부산 서면점', date: '2026-06-07', views: 42, content: '이번 주말 주문량이 급증하여 서면점 아메리카노 원두 재고가 빠듯합니다. 인근 지점 여유분 공유 부탁드려요!' },
    { id: 2, title: '물류 배송 차량 경로 최적화 아이디어 제안', author: '박물류', branch: '본사 물류팀', date: '2026-06-05', views: 128, content: '해운대구와 수영구 통합 배송 노선을 조정하면 유류비를 약 15% 아낄 수 있을 것 같습니다. 상세 파일 첨부합니다.' },
    { id: 1, title: 'CAFE LOGISTICS ERP 시스템 오픈을 축하드립니다!', author: '관리자', branch: '본사 시스템팀', date: '2026-06-01', views: 256, content: '드디어 26개 지점 통합 재고 관리 및 대시보드가 오픈되었습니다. 원활한 소통을 위해 본 게시판을 적극 활용해 주세요.' },
  ]);

  // 현재 선택된 게시글 (null이면 목록 화면, 값이 있으면 상세 화면)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // 글쓰기 모드 상태
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newContent, setNewContent] = useState('');

  // 새 글 등록 함수
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newContent) {
      alert('제목, 작성자, 내용은 필수 입력 항목입니다!');
      return;
    }

    const newPostItem: Post = {
      id: posts.length + 1,
      title: newTitle,
      author: newAuthor,
      branch: newBranch || '본사',
      date: new Date().toISOString().split('T')[0],
      views: 1,
      content: newContent,
    };

    setPosts([newPostItem, ...posts]);
    setIsWriting(false);
    setNewTitle('');
    setNewAuthor('');
    setNewBranch('');
    setNewContent('');
  };

  return (
    <div className="community-container">
      
      {/* 상단 타이틀 영역 */}
      <div className="community-header">
        <h2 className="community-title">
          💬 지점 소통 커뮤니티
        </h2>
        <p className="community-subtitle">전국 26개 지점 임직원분들이 실시간으로 소통하고 정보를 공유하는 공간입니다.</p>
      </div>

      {/* 1. 글 작성 폼 화면 */}
      {isWriting ? (
        <div className="card-box">
          <h3 className="form-title">✍️ 새 게시글 작성</h3>
          <form onSubmit={handleCreatePost} className="write-form">
            <input 
              type="text" 
              placeholder="글 제목을 입력하세요" 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              className="common-input"
            />
            <div className="form-row">
              <input 
                type="text" 
                placeholder="작성자 이름" 
                value={newAuthor} 
                onChange={(e) => setNewAuthor(e.target.value)}
                className="common-input flex-1"
              />
              <input 
                type="text" 
                placeholder="소속 지점 (예: 부산 서면점)" 
                value={newBranch} 
                onChange={(e) => setNewBranch(e.target.value)}
                className="common-input flex-1"
              />
            </div>
            <textarea 
              placeholder="내용을 입력하세요..." 
              rows={8} 
              value={newContent} 
              onChange={(e) => setNewContent(e.target.value)}
              className="common-input textarea"
            />
            <div className="form-btn-group">
              <button type="button" onClick={() => setIsWriting(false)} className="cancel-btn">취소</button>
              <button type="submit" className="submit-btn">등록하기</button>
            </div>
          </form>
        </div>
      ) : selectedPost ? (
        /* 2. 게시글 상세 보기 화면 */
        <div className="card-box">
          <button onClick={() => setSelectedPost(null)} className="back-btn">← 목록으로 돌아가기</button>
          <div className="detail-header">
            <span className="branch-badge">
              {selectedPost.branch}
            </span>
            <h2 className="detail-title">{selectedPost.title}</h2>
            <div className="detail-meta">
              <span>작성자: <strong>{selectedPost.author}</strong></span>
              <span>등록일: {selectedPost.date} | 조회수: {selectedPost.views}</span>
            </div>
          </div>
          <div className="detail-content">
            {selectedPost.content}
          </div>
          <div className="comment-section">
            <h4 className="comment-title">💬 댓글 (0)</h4>
            <div className="comment-form">
              <input type="text" placeholder="댓글을 입력하세요..." className="common-input flex-1 bg-white" />
              <button className="submit-btn comment-submit">등록</button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. 게시글 목록 화면 */
        <div>
          <div className="list-top-bar">
            <span className="list-count-text">총 <strong>{posts.length}</strong>개의 이야기가 있습니다.</span>
            <button onClick={() => setIsWriting(true)} className="submit-btn">✏️ 글쓰기</button>
          </div>

          <div className="table-wrap">
            <table className="community-table">
              <thead>
                <tr>
                  <th className="td-center td-id">번호</th>
                  <th className="td-center td-branch">지점</th>
                  <th>제목</th>
                  <th className="td-center td-author">작성자</th>
                  <th className="td-center td-date">날짜</th>
                  <th className="td-center td-views">조회</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                  >
                    <td className="td-center td-id">{post.id}</td>
                    <td className="td-center td-branch">
                      <span className="branch-badge small">
                        {post.branch}
                      </span>
                    </td>
                    <td className="td-post-title">{post.title}</td>
                    <td className="td-center td-author">{post.author}</td>
                    <td className="td-center td-date">{post.date}</td>
                    <td className="td-center td-views">{post.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}