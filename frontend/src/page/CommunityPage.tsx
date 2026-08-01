import React, { useState, useEffect } from 'react';
import './CommunityPage.css';

interface Post {
  id: number;
  title: string;
  author: string;
  branch: string;
  date: string;
  views: number;
  content: string;
  category: string;
  likes: number;
  viewedUsers?: string[]; // 💡 계정별 조회 중복 방지를 위한 조회 기록 배열
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
}

// 초기 기본 게시글 데이터
const initialPosts: Post[] = [
  { 
    id: 7, 
    title: '[필독] 2026년 하반기 전 지점 위생 및 세스코 방역 점검 안내', 
    author: '관리자', 
    branch: '본사 운영팀', 
    date: '2026-06-15', 
    views: 84, 
    content: '하반기 전 지점 위생 점검 일정을 공지합니다. 첨부된 매뉴얼을 참고하시어 사전 점검에 만전을 기해 주시기 바랍니다.', 
    category: '공지사항', 
    likes: 12,
    viewedUsers: []
  },
  { 
    id: 6, 
    title: '[보안] ERP 시스템 계정 관리 및 개인정보 보호 수칙 준수', 
    author: '관리자', 
    branch: '본사 시스템팀', 
    date: '2026-06-12', 
    views: 112, 
    content: '최근 보안 사고 예방을 위해 모든 임직원께서는 주기적인 비밀번호 변경 및 공용 PC 로그아웃을 철저히 생활해 주시기 바랍니다.', 
    category: '공지사항', 
    likes: 19,
    viewedUsers: []
  },
  { 
    id: 5, 
    title: '6월 두 번째 주 스페셜 원두 납품 일정 변경 안내', 
    author: '박물류', 
    branch: '본사 물류팀', 
    date: '2026-06-10', 
    views: 95, 
    content: '지방선거 공휴일 물류 센터 휴무로 인해 이번 주 원두 배송이 기존보다 하루씩 지연될 예정이오니 영업에 차질 없으시길 바랍니다.', 
    category: '원두/재고', 
    likes: 8,
    viewedUsers: []
  },
  { 
    id: 4, 
    title: '여름 시즌 신메뉴 "콜드브루 하와이안 라떼" 레시피 공유', 
    author: '이개발', 
    branch: '본사 R&D팀', 
    date: '2026-06-08', 
    views: 176, 
    content: '다음 달 출시되는 여름 시즌 신메뉴 레시피 매뉴얼과 파우더 계량 가이드를 등록합니다. 각 지점에서는 미리 숙지해 주세요.', 
    category: '물류/아이디어', 
    likes: 31,
    viewedUsers: []
  },
  { id: 3, title: '부산 서면점 원두 재고 부족 관련 공유합니다.', author: '김지점', branch: '부산 서면점', date: '2026-06-07', views: 42, content: '이번 주말 주문량이 급증하여 서면점 아메리카노 원두 재고가 빠듯합니다. 인근 지점 여유분 공유 부탁드려요!', category: '원두/재고', likes: 5, viewedUsers: [] },
  { id: 2, title: '물류 배송 차량 경로 최적화 아이디어 제안', author: '박물류', branch: '본사 물류팀', date: '2026-06-05', views: 128, content: '해운대구와 수영구 통합 배송 노선을 조정하면 유류비를 약 15% 아낄 수 있을 것 같습니다. 상세 파일 첨부합니다.', category: '물류/아이디어', likes: 14, viewedUsers: [] },
  { id: 1, title: 'CAFE LOGISTICS ERP 시스템 오픈을 축하드립니다!', author: '관리자', branch: '본사 시스템팀', date: '2026-06-01', views: 256, content: '드디어 26개 지점 통합 재고 관리 및 대시보드가 오픈되었습니다. 원활한 소통을 위해 본 게시판을 적극 활용해 주세요.', category: '공지사항', likes: 23, viewedUsers: [] },
];

export default function CommunityPage() {
  // 💡 현재 로그인한 사용자 계정 (실제 프로젝트 환경에 맞춰 변경 가능, 테스트용 기본값 '관리자')
  const [currentUser] = useState<string>(() => {
    return localStorage.getItem('erp_current_user') || '관리자';
  });

  // 💡 브라우저 localStorage에서 데이터를 불러오거나 없으면 기본값 사용[cite: 3]
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('erp_community_posts');
    if (savedPosts) {
      try {
        return JSON.parse(savedPosts);
      } catch (e) {
        console.error(e);
      }
    }
    return initialPosts;
  });

  // posts가 변경될 때마다 localStorage에 자동 저장[cite: 3]
  useEffect(() => {
    localStorage.setItem('erp_community_posts', JSON.stringify(posts));
  }, [posts]);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // ✍️ 글 작성 상태
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newCategory, setNewCategory] = useState('원두/재고');
  const [newContent, setNewContent] = useState('');

  // 🔍 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 💬 댓글 목록 상태
  const [commentsMap, setCommentsMap] = useState<{ [postId: number]: Comment[] }>({
    2: [
      { id: 1, author: '조우진', content: '좋은 아이디어네요 적극 찬성합니다!', date: '2026-06-06' }
    ]
  });

  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // 🖱️ 게시글 클릭 시 조회수 중복 방지 및 증가 처리 핸들러
  const handleSelectPost = (post: Post) => {
    const viewedList = post.viewedUsers || [];
    
    let updatedPosts = posts;
    // 현재 로그인한 계정이 이 글을 아직 본 적이 없다면 조회수 증가 및 기록
    if (!viewedList.includes(currentUser)) {
      updatedPosts = posts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            views: p.views + 1,
            viewedUsers: [...(p.viewedUsers || []), currentUser]
          };
        }
        return p;
      });
      setPosts(updatedPosts);
    }

    const clickedPost = updatedPosts.find(p => p.id === post.id);
    setSelectedPost(clickedPost || post);
  };

  // ✏️ 게시글 등록 핸들러
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newContent) {
      alert('제목, 작성자, 내용은 필수 입력 항목입니다!');
      return;
    }

    const newPostItem: Post = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      title: newTitle,
      author: newAuthor,
      branch: newBranch || '본사',
      date: new Date().toISOString().split('T')[0],
      views: 0, // 처음 등록 시 조회수 0부터 시작
      content: newContent,
      category: newCategory,
      likes: 0,
      viewedUsers: [],
    };

    setPosts([newPostItem, ...posts]);
    setIsWriting(false);
    setNewTitle('');
    setNewAuthor('');
    setNewBranch('');
    setNewContent('');
    setNewCategory('원두/재고');
  };

  // 🗑️ 게시글 삭제 핸들러
  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== postId));
      setSelectedPost(null);
    }
  };

  // 👍 좋아요(도움돼요) 증가 핸들러
  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({ ...selectedPost, likes: selectedPost.likes + 1 });
    }
  };

  // 💬 댓글 추가 핸들러
  const handleAddComment = () => {
    if (!commentInput.trim()) {
      alert('댓글 내용을 입력해주세요!');
      return;
    }
    if (!selectedPost) return;

    const currentComments = commentsMap[selectedPost.id] || [];
    const newComment: Comment = {
      id: Date.now(),
      author: currentUser, // 현재 로그인한 계정명 반영
      content: commentInput,
      date: new Date().toISOString().split('T')[0],
    };

    setCommentsMap({
      ...commentsMap,
      [selectedPost.id]: [...currentComments, newComment]
    });
    setCommentInput('');
  };

  // 🗑️ 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (!selectedPost) return;
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      const currentComments = commentsMap[selectedPost.id] || [];
      const updatedComments = currentComments.filter(c => c.id !== commentId);
      setCommentsMap({
        ...commentsMap,
        [selectedPost.id]: updatedComments
      });
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleSaveEdit = (commentId: number) => {
    if (!editText.trim()) {
      alert('수정할 내용을 입력해주세요!');
      return;
    }
    if (!selectedPost) return;

    const currentComments = commentsMap[selectedPost.id] || [];
    const updatedComments = currentComments.map(c => {
      if (c.id === commentId) {
        return { ...c, content: editText };
      }
      return c;
    });

    setCommentsMap({
      ...commentsMap,
      [selectedPost.id]: updatedComments
    });
    setEditingCommentId(null);
    setEditText('');
  };

  // 🔍 카테고리 및 검색어에 따른 필터링 로직
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.branch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentComments = selectedPost ? (commentsMap[selectedPost.id] || []) : [];

  return (
    <div className="community-container">
      
      <div className="community-header">
        <h2 className="community-title">
          💬 지점 소통 커뮤니티
        </h2>
        <p className="community-subtitle">전국 26개 지점 임직원분들이 실시간으로 소통하고 정보를 공유하는 공간입니다.</p>
      </div>

      {isWriting ? (
        <div className="card-box">
          <h3 className="form-title">✍️ 새 게시글 작성</h3>
          <form onSubmit={handleCreatePost} className="write-form">
            <div className="form-row">
              <select 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)} 
                className="common-input"
                style={{ width: '150px' }}
              >
                <option value="원두/재고">원두/재고</option>
                <option value="물류/아이디어">물류/아이디어</option>
                <option value="공지사항">공지사항</option>
                <option value="자유소통">자유소통</option>
              </select>
              <input 
                type="text" 
                placeholder="글 제목을 입력하세요" 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)}
                className="common-input flex-1"
              />
            </div>
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
        <div className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button onClick={() => setSelectedPost(null)} className="back-btn" style={{ margin: 0 }}>← 목록으로 돌아가기</button>
            <button 
              onClick={() => handleDeletePost(selectedPost.id)} 
              style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🗑️ 글 삭제하기
            </button>
          </div>

          <div className="detail-header">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="branch-badge">[{selectedPost.category}]</span>
              <span className="branch-badge">{selectedPost.branch}</span>
            </div>
            <h2 className="detail-title">{selectedPost.title}</h2>
            <div className="detail-meta">
              <span>작성자: <strong>{selectedPost.author}</strong></span>
              <span>등록일: {selectedPost.date} | 조회수: {selectedPost.views} | 👍 도움돼요: {selectedPost.likes}</span>
            </div>
          </div>
          <div className="detail-content">
            {selectedPost.content}
          </div>

          {/* 상세 보기 하단 좋아요 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <button 
              onClick={(e) => handleLike(selectedPost.id, e)}
              style={{ background: '#f5efe6', border: '1px solid #d7ccc8', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', color: '#5d4037', cursor: 'pointer', fontSize: '15px' }}
            >
              👍 도움돼요! ({selectedPost.likes})
            </button>
          </div>

          <div className="comment-section">
            <h4 className="comment-title">💬 댓글 ({currentComments.length})</h4>
            
            <div className="comment-form">
              <input 
                type="text" 
                placeholder="댓글을 입력하세요..." 
                className="common-input flex-1 bg-white" 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
              />
              <button className="submit-btn comment-submit" onClick={handleAddComment}>등록</button>
            </div>

            <div className="comment-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentComments.length === 0 ? (
                <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '10px 0' }}>아직 등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
              ) : (
                currentComments.map((comment) => (
                  <div key={comment.id} style={{ background: '#f9f6f0', padding: '12px 16px', borderRadius: '8px', border: '1px solid #eae3d2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px', color: '#333' }}>{comment.author}</strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>{comment.date}</span>
                        {editingCommentId !== comment.id && (
                          <>
                            <button onClick={() => handleStartEdit(comment)} style={{ background: 'none', border: 'none', color: '#6b4f3f', fontSize: '12px', cursor: 'pointer', padding: 0 }}>수정</button>
                            <button onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', color: '#d9534f', fontSize: '12px', cursor: 'pointer', padding: 0 }}>삭제</button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button onClick={() => setEditingCommentId(null)} style={{ padding: '4px 10px', background: '#ccc', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                          <button onClick={() => handleSaveEdit(comment.id)} style={{ padding: '4px 10px', background: '#6b4f3f', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>수정완료</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '14px', color: '#555', margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      ) : (
        <div>
          {/* 🔍 상단 필터 및 검색 바 영역 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['전체', '원두/재고', '물류/아이디어', '공지사항', '자유소통'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #d7ccc8',
                    background: selectedCategory === cat ? '#5d4037' : '#fffdf9',
                    color: selectedCategory === cat ? '#fff' : '#5d4037',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text"
                placeholder="검색어 입력..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #d7ccc8', fontSize: '13px', outline: 'none', width: '180px' }}
              />
              <button onClick={() => setIsWriting(true)} className="submit-btn">✏️ 글쓰기</button>
            </div>
          </div>

          <div className="list-top-bar">
            <span className="list-count-text">검색된 이야기: <strong>{filteredPosts.length}</strong>개</span>
          </div>

          <div className="table-wrap" style={{ maxHeight: '620px', overflowY: 'auto' }}>
            <table className="community-table">
              <thead>
                <tr>
                  <th className="td-center td-id">번호</th>
                  <th className="td-center td-branch">분류 / 지점</th>
                  <th>제목</th>
                  <th className="td-center td-author">작성자</th>
                  <th className="td-center td-date">날짜</th>
                  <th className="td-center td-views">조회</th>
                  <th className="td-center" style={{ width: '70px' }}>좋아요</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>검색 결과가 없습니다.</td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr key={post.id} onClick={() => handleSelectPost(post)}>
                      <td className="td-center td-id">{post.id}</td>
                      <td className="td-center td-branch" style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                        <span className="branch-badge small" style={{ background: '#e0d8d0' }}>{post.category}</span>
                        <span className="branch-badge small">{post.branch}</span>
                      </td>
                      <td className="td-post-title">{post.title}</td>
                      <td className="td-center td-author">{post.author}</td>
                      <td className="td-center td-date">{post.date}</td>
                      <td className="td-center td-views">{post.views}</td>
                      <td className="td-center" style={{ color: '#5d4037', fontWeight: 'bold' }}>
                        👍 {post.likes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}