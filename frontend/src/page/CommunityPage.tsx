import React, { useState, useEffect } from 'react';
import {
  Pin,
  Paperclip,
  ThumbsUp,
  MessageSquare,
  Trash2,
  Edit3,
  CornerDownRight,
  Search,
  X,
  FileText,
  Download
} from 'lucide-react';
import './CommunityPage.css';

export type ProcessStatus = '접수중' | '처리중' | '조치완료';
export type Category = '전체' | '원두/재고' | '물류/아이디어' | '공지사항' | '자유소통';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  content?: string;
}

export interface Comment {
  id: number;
  author: string;
  branch: string;
  content: string;
  createdAt: string;
  likes: number;
  parentId?: number | null;
}

export interface Post {
  id: number;
  category: Category;
  title: string;
  content: string;
  author: string;
  branch: string;
  createdAt: string;
  views: number;
  likes: number;
  isPinned: boolean;
  status?: ProcessStatus;
  attachments: FileItem[];
  comments: Comment[];
}

export interface User {
  id: string;
  name: string;
  branch: string;
  role: 'USER' | 'ADMIN';
}

const STORAGE_KEY = 'cafe_logistics_community_posts_v1';

// ✅ [수정] 고정된 currentUser 대신 로그인 세션(localStorage 'user')에서 사용자 정보를 읽어오는 함수 추가
const getActiveUser = (): User => {
  const fallbackUser: User = {
    id: 'guest',
    name: '조우진',
    branch: '부산 서면점',
    role: 'ADMIN',
  };

  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return fallbackUser;

    const parsed = JSON.parse(rawUser);
    if (!parsed || typeof parsed !== 'object') return fallbackUser;

    const rawRole = String(parsed.role || '').toUpperCase();
    const normalizedRole: 'USER' | 'ADMIN' =
      rawRole.includes('ADMIN') || rawRole.includes('관리자') ? 'ADMIN' : 'USER';

    const resolvedName =
      typeof parsed.name === 'string' && parsed.name.trim()
        ? parsed.name.trim()
        : typeof parsed.email === 'string' && parsed.email.trim()
          ? parsed.email.trim()
          : fallbackUser.name;

    const resolvedBranch =
      typeof parsed.branch === 'string' && parsed.branch.trim()
        ? parsed.branch.trim()
        : fallbackUser.branch;

    return {
      id: String(parsed.id || parsed.email || resolvedName),
      name: resolvedName,
      branch: resolvedBranch,
      role: normalizedRole,
    };
  } catch (e) {
    console.error('로그인 사용자 정보 불러오기 실패:', e);
    return fallbackUser;
  }
};

const branchList = [
  '부산 서면점',
  '부산 본사 물류센터2지점',
  '서울 강남점',
  '대구 동성로점',
  '대전 타임월드점',
  '광주 상무점'
];

const initialPosts: Post[] = [
  {
    id: 9,
    category: '원두/재고',
    title: 'LLL / LOLOL 테스트 게시글',
    content: '테스트 내용입니다.',
    author: '조우진',
    branch: '부산 서면점',
    createdAt: '2026-11-04',
    views: 3,
    likes: 0,
    isPinned: false,
    attachments: [
      {
        id: 'file-1',
        name: 'geniemusic.log',
        size: 16384,
        type: 'text/plain',
        content: '[2026-11-04 10:30:12] [INFO] GenieMusic API Connected Successfully.\n[2026-11-04 10:30:15] [INFO] Playing track: 작은 봄 - 고추잠자리'
      }
    ],
    comments: []
  },
  {
    id: 7,
    category: '공지사항',
    title: '[필독] 2026년 하반기 전 지점 위생 및 세스코 방역 점검 안내',
    content: '전 지점 위생 점검 일정 공유드립니다. 각 지점에서는 미리 준비해주세요.',
    author: '관리자',
    branch: '본사 운영팀',
    createdAt: '2026-06-15',
    views: 85,
    likes: 14,
    isPinned: true,
    attachments: [],
    comments: []
  },
  {
    id: 3,
    category: '원두/재고',
    title: '부산 서면점 원두 재고 부족 관련 공유합니다.',
    content: '주말 물량 증가로 인해 다크 로스트 원두 재고가 부족합니다.',
    author: '김지점',
    branch: '부산 서면점',
    createdAt: '2026-06-07',
    views: 42,
    likes: 5,
    isPinned: false,
    status: '처리중',
    attachments: [],
    comments: []
  }
];

const loadSavedPosts = (): Post[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialPosts;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPosts;
  } catch (e) {
    console.error('게시글 불러오기 실패:', e);
    return initialPosts;
  }
};

export const CommunityBoard: React.FC = () => {
  // ✅ [수정] 현재 로그인한 사용자 상태를 관리하도록 변경
  const [currentUser, setCurrentUser] = useState<User>(getActiveUser);

  const [posts, setPosts] = useState<Post[]>(loadSavedPosts);
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [searchTarget, setSearchTarget] = useState<'all' | 'title' | 'author' | 'branch'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'write' | 'edit'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // 글 작성 상태
  const [newCategory, setNewCategory] = useState<Category>('원두/재고');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newIsPinned, setNewIsPinned] = useState<boolean>(false);
  const [newStatus] = useState<ProcessStatus>('접수중');
  const [selectedBranch, setSelectedBranch] = useState<string>(currentUser.branch);
  const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);

  // 글 수정 상태
  const [editCategory, setEditCategory] = useState<Category>('원두/재고');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editBranch, setEditBranch] = useState<string>(currentUser.branch);
  const [editIsPinned, setEditIsPinned] = useState<boolean>(false);
  const [editStatus, setEditStatus] = useState<ProcessStatus>('접수중');

  // 댓글 상태
  const [commentInput, setCommentInput] = useState<string>('');
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);

  // ✅ [수정] 탭 이동/포커스/스토리지 변경 시 로그인 계정 정보 동기화
  useEffect(() => {
    const syncUserFromStorage = () => {
      const updatedUser = getActiveUser();
      setCurrentUser(updatedUser);
      setSelectedBranch((prevBranch) =>
        branchList.includes(updatedUser.branch) ? updatedUser.branch : prevBranch || updatedUser.branch
      );
    };

    syncUserFromStorage();
    window.addEventListener('focus', syncUserFromStorage);
    window.addEventListener('storage', syncUserFromStorage);

    return () => {
      window.removeEventListener('focus', syncUserFromStorage);
      window.removeEventListener('storage', syncUserFromStorage);
    };
  }, []);

  // 6번 해결: posts가 바뀔 때마다 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('게시글 저장 실패 (용량 초과 가능):', e);
    }
  }, [posts]);

  const handleFileDownload = (file: FileItem) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const fileContent =
        file.content ||
        `[CAFE LOGISTICS ERP Log File]\nFile Name: ${file.name}\nGenerated Date: ${new Date().toLocaleString()}`;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    filesArray.forEach((file, idx) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          const newFileItem: FileItem = {
            id: `${Date.now()}-${idx}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: base64Url,
          };
          setAttachedFiles((prev) => [...prev, newFileItem]);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const textContent = event.target?.result as string;
          const newFileItem: FileItem = {
            id: `${Date.now()}-${idx}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: textContent,
          };
          setAttachedFiles((prev) => [...prev, newFileItem]);
        };
        reader.readAsText(file);
      }
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    // ✅ [수정] 글 등록 시점의 최신 로그인 사용자를 작성자로 반영
    const activeUser = getActiveUser();
    setCurrentUser(activeUser);

    const newPost: Post = {
      id: Date.now(),
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: activeUser.name,
      branch: selectedBranch,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      isPinned: activeUser.role === 'ADMIN' ? newIsPinned : false,
      status: newCategory === '원두/재고' ? newStatus : undefined,
      attachments: attachedFiles,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewTitle('');
    setNewContent('');
    setAttachedFiles([]);
    setNewIsPinned(false);
    setViewMode('list');
  };

  // 5번 해결: 수정 모드 진입
  const handleStartEdit = (post: Post) => {
    setEditCategory(post.category);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditBranch(post.branch);
    setEditIsPinned(post.isPinned);
    setEditStatus(post.status || '접수중');
    setViewMode('edit');
  };

  // 5번 해결: 수정 내용 저장
  const handleUpdatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostId || !editTitle.trim() || !editContent.trim()) return;

    // ✅ [수정] 수정 저장 시점의 최신 로그인 권한 반영
    const activeUser = getActiveUser();
    setCurrentUser(activeUser);

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== selectedPostId) return post;
        return {
          ...post,
          category: editCategory,
          title: editTitle.trim(),
          content: editContent.trim(),
          branch: editBranch,
          isPinned: activeUser.role === 'ADMIN' ? editIsPinned : post.isPinned,
          status: editCategory === '원두/재고' ? editStatus : undefined,
        };
      })
    );

    setViewMode('detail');
  };

  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setViewMode('list');
      setSelectedPostId(null);
    }
  };

  const handleStatusChange = (postId: number, updatedStatus: ProcessStatus) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, status: updatedStatus } : post))
    );
  };

  const handleLikePost = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
    );
  };

  const handleAddComment = (postId: number) => {
    if (!commentInput.trim()) return;

    // ✅ [수정] 댓글 작성 시점의 최신 로그인 사용자를 작성자로 반영
    const activeUser = getActiveUser();
    setCurrentUser(activeUser);

    const newComment: Comment = {
      id: Date.now(),
      author: activeUser.name,
      branch: activeUser.branch,
      content: commentInput.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      parentId: replyTargetId,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      })
    );

    setCommentInput('');
    setReplyTargetId(null);
  };

  const handleDeleteComment = (postId: number, commentId: number) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const updatedComments = post.comments.filter(
              (c) => c.id !== commentId && c.parentId !== commentId
            );
            return { ...post, comments: updatedComments };
          }
          return post;
        })
      );
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      const matchesCategory = activeCategory === '전체' || post.category === activeCategory;

      let matchesSearch = true;
      if (searchKeyword.trim() !== '') {
        const kw = searchKeyword.toLowerCase();
        if (searchTarget === 'title') matchesSearch = post.title.toLowerCase().includes(kw);
        else if (searchTarget === 'author') matchesSearch = post.author.toLowerCase().includes(kw);
        else if (searchTarget === 'branch') matchesSearch = post.branch.toLowerCase().includes(kw);
        else
          matchesSearch =
            post.title.toLowerCase().includes(kw) ||
            post.content.toLowerCase().includes(kw) ||
            post.author.toLowerCase().includes(kw);
      }

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.id - a.id;
    });

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  return (
    <div className="community-container">
      <header className="community-header">
        <h1>💬 지점 소통 커뮤니티</h1>
        <p>전국 26개 지점 임직원분들이 실시간으로 소통하고 정보를 공유하는 공간입니다.</p>
      </header>

      {viewMode === 'list' && (
        <main>
          <div className="community-toolbar">
            <div className="category-group">
              {(['전체', '원두/재고', '물류/아이디어', '공지사항', '자유소통'] as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="search-write-group">
              <select
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value as any)}
                className="search-select"
              >
                <option value="all">전체검색</option>
                <option value="title">제목+내용</option>
                <option value="author">작성자</option>
                <option value="branch">지점명</option>
              </select>

              <div className="search-input-wrap">
                <input
                  type="text"
                  placeholder="검색어 입력..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
                <Search size={16} className="search-icon" />
              </div>

              {/* ✅ [수정] 글쓰기 버튼 클릭 시 최신 로그인 사용자 및 지점으로 상태 동기화 */}
              <button
                onClick={() => {
                  const latestUser = getActiveUser();
                  setCurrentUser(latestUser);
                  setSelectedBranch(
                    branchList.includes(latestUser.branch) ? latestUser.branch : branchList[0]
                  );
                  setViewMode('write');
                }}
                className="write-btn"
              >
                ✏️ 글쓰기
              </button>
            </div>
          </div>

          <div className="search-count-bar">
            검색된 이야기: <strong>{filteredPosts.length}개</strong>
          </div>

          <div className="table-wrapper">
            <table className="community-table">
              <thead>
                <tr>
                  <th className="col-num">번호</th>
                  <th className="col-category">분류 / 지점</th>
                  <th className="col-title">제목</th>
                  <th className="col-author">작성자</th>
                  <th className="col-date">날짜</th>
                  <th className="col-views">조회</th>
                  <th className="col-likes">좋아요</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => {
                      setSelectedPostId(post.id);
                      setPosts((prev) =>
                        prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p))
                      );
                      setViewMode('detail');
                    }}
                    className={`post-row ${post.isPinned ? 'pinned-row' : ''}`}
                  >
                    <td className="col-num">
                      {post.isPinned ? <Pin size={16} className="pin-icon" /> : post.id}
                    </td>
                    <td className="col-category">
                      <div className="tag-group">
                        <span className="badge-category">{post.category}</span>
                        <span className="badge-branch">{post.branch}</span>
                      </div>
                    </td>
                    <td className="col-title">
                      <div className="title-flex">
                        {post.status && (
                          <span className={`status-badge ${post.status}`}>[{post.status}]</span>
                        )}
                        <span className={`title-text ${post.isPinned ? 'pinned-title' : ''}`}>
                          {post.title}
                        </span>
                        {post.attachments.length > 0 && <Paperclip size={14} className="file-icon" />}
                        {post.comments.length > 0 && (
                          <span className="comment-count">[{post.comments.length}]</span>
                        )}
                      </div>
                    </td>
                    <td className="col-author">{post.author}</td>
                    <td className="col-date">{post.createdAt}</td>
                    <td className="col-views">{post.views}</td>
                    <td className="col-likes">👍 {post.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {viewMode === 'detail' && selectedPost && (
        <main className="detail-card">
          <div className="detail-top-bar">
            <button onClick={() => setViewMode('list')} className="back-btn">
              ← 목록으로 돌아가기
            </button>

            {(selectedPost.author === currentUser.name || currentUser.role === 'ADMIN') && (
              <div className="detail-actions-right">
                <button
                  type="button"
                  onClick={() => handleStartEdit(selectedPost)}
                  className="edit-btn"
                >
                  <Edit3 size={14} /> 글 수정하기
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="delete-btn"
                >
                  <Trash2 size={14} /> 글 삭제하기
                </button>
              </div>
            )}
          </div>

          <div className="detail-header-meta">
            <div className="badge-group">
              <span className="badge-category">{selectedPost.category}</span>
              <span className="badge-branch">{selectedPost.branch}</span>
              {selectedPost.status && (
                <select
                  value={selectedPost.status}
                  onChange={(e) => handleStatusChange(selectedPost.id, e.target.value as ProcessStatus)}
                  className="status-select"
                >
                  <option value="접수중">접수중</option>
                  <option value="처리중">처리중</option>
                  <option value="조치완료">조치완료</option>
                </select>
              )}
            </div>

            <h2 className="detail-title">{selectedPost.title}</h2>
            <div className="detail-info-bar">
              <div>
                작성자: <strong>{selectedPost.author}</strong> ({selectedPost.branch})
              </div>
              <div>
                등록일: {selectedPost.createdAt} | 조회수: {selectedPost.views}
              </div>
            </div>
          </div>

          <div className="detail-content">{selectedPost.content}</div>

          {selectedPost.attachments.length > 0 && (
            <div className="attachment-box">
              <h4>
                <Paperclip size={14} /> 첨부파일 ({selectedPost.attachments.length})
              </h4>
              <div className="attachment-list">
                {selectedPost.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="attachment-item clickable"
                    onClick={() => handleFileDownload(file)}
                    title="클릭하여 파일 다운로드"
                  >
                    <FileText size={14} />
                    <span className="file-name-text">{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                    <Download size={13} className="download-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="like-section">
            <button onClick={() => handleLikePost(selectedPost.id)} className="like-action-btn">
              <ThumbsUp size={16} /> 도움이 돼요! ({selectedPost.likes})
            </button>
          </div>

          <section className="comment-section">
            <h3>
              <MessageSquare size={16} /> 댓글 ({selectedPost.comments.length})
            </h3>

            <div className="comment-list">
              {selectedPost.comments
                .filter((c) => !c.parentId)
                .map((comment) => (
                  <div key={comment.id} className="comment-item-box">
                    <div className="comment-meta">
                      <strong>
                        {comment.author} ({comment.branch})
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="comment-date">{comment.createdAt}</span>
                        <button
                          onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: '#EF4444',
                            padding: 0,
                          }}
                          title="댓글 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="comment-text">{comment.content}</p>

                    <button
                      onClick={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}
                      className="reply-toggle-btn"
                    >
                      답글 달기
                    </button>

                    {selectedPost.comments
                      .filter((reply) => reply.parentId === comment.id)
                      .map((reply) => (
                        <div key={reply.id} className="reply-item-box">
                          <CornerDownRight size={14} className="reply-arrow" />
                          <div className="reply-content-box">
                            <div className="comment-meta">
                              <strong>
                                {reply.author} ({reply.branch})
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="comment-date">{reply.createdAt}</span>
                                <button
                                  onClick={() => handleDeleteComment(selectedPost.id, reply.id)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    padding: 0,
                                  }}
                                  title="답글 삭제"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <p className="reply-text">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
            </div>

            <div className="comment-input-area">
              {replyTargetId && (
                <div className="reply-notice-bar">
                  <span>선택한 댓글에 답글 작성 중...</span>
                  <button onClick={() => setReplyTargetId(null)} className="cancel-reply-btn">
                    취소
                  </button>
                </div>
              )}
              <div className="comment-form-row">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="comment-input"
                />
                <button onClick={() => handleAddComment(selectedPost.id)} className="comment-submit-btn">
                  등록
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {viewMode === 'edit' && selectedPost && (
        <main className="write-card">
          <h2>✏️ 게시글 수정</h2>
          <form onSubmit={handleUpdatePost} className="write-form">
            <div className="write-row">
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
                className="write-category-select"
              >
                <option value="원두/재고">원두/재고</option>
                <option value="물류/아이디어">물류/아이디어</option>
                <option value="공지사항">공지사항</option>
                <option value="자유소통">자유소통</option>
              </select>

              <input
                type="text"
                placeholder="글 제목을 입력하세요"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="write-title-input"
                required
              />
            </div>

            <div className="write-row">
              <input
                type="text"
                value={`작성자: ${selectedPost.author}`}
                disabled
                className="write-disabled-input"
              />
              <select
                value={editBranch}
                onChange={(e) => setEditBranch(e.target.value)}
                className="write-category-select"
                style={{ width: '100%', flex: 1, backgroundColor: '#FFF' }}
              >
                {branchList.map((branchName) => (
                  <option key={branchName} value={branchName}>
                    소속 지점: {branchName}
                  </option>
                ))}
              </select>
            </div>

            {editCategory === '원두/재고' && (
              <div className="write-row">
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProcessStatus)}
                  className="write-category-select"
                  style={{ width: '200px' }}
                >
                  <option value="접수중">처리상태: 접수중</option>
                  <option value="처리중">처리상태: 처리중</option>
                  <option value="조치완료">처리상태: 조치완료</option>
                </select>
              </div>
            )}

            {/* ✅ [수정] 현재 로그인 권한 기준으로 공지 상단 고정 체크박스 표시 */}
            {currentUser.role === 'ADMIN' && (
              <label className="pin-checkbox-label">
                <input
                  type="checkbox"
                  checked={editIsPinned}
                  onChange={(e) => setEditIsPinned(e.target.checked)}
                />
                📌 중요 공지로 상단 고정 (Notice Pinning)
              </label>
            )}

            <textarea
              placeholder="내용을 입력하세요..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={8}
              className="write-textarea"
              required
            />

            <div className="write-btn-group">
              <button type="button" onClick={() => setViewMode('detail')} className="cancel-btn">
                취소
              </button>
              <button type="submit" className="submit-btn">
                수정 완료
              </button>
            </div>
          </form>
        </main>
      )}

      {viewMode === 'write' && (
        <main className="write-card">
          <h2>✍️ 새 게시글 작성</h2>
          <form onSubmit={handleCreatePost} className="write-form">
            <div className="write-row">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
                className="write-category-select"
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
                className="write-title-input"
                required
              />
            </div>

            <div className="write-row">
              <input
                type="text"
                value={`작성자: ${currentUser.name}`}
                disabled
                className="write-disabled-input"
              />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="write-category-select"
                style={{ width: '100%', flex: 1, backgroundColor: '#FFF' }}
              >
                {branchList.map((branchName) => (
                  <option key={branchName} value={branchName}>
                    소속 지점: {branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ [수정] 현재 로그인 권한 기준으로 공지 상단 고정 체크박스 표시 */}
            {currentUser.role === 'ADMIN' && (
              <label className="pin-checkbox-label">
                <input
                  type="checkbox"
                  checked={newIsPinned}
                  onChange={(e) => setNewIsPinned(e.target.checked)}
                />
                📌 중요 공지로 상단 고정 (Notice Pinning)
              </label>
            )}

            <textarea
              placeholder="내용을 입력하세요..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={8}
              className="write-textarea"
              required
            />

            <div className="file-upload-box">
              <label className="file-upload-label">
                <Paperclip size={14} /> 파일/이미지 첨부
                <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              {attachedFiles.length > 0 && (
                <div className="attached-files-preview">
                  {attachedFiles.map((file) => (
                    <div key={file.id} className="preview-chip">
                      <span>{file.name}</span>
                      <X size={14} onClick={() => handleRemoveFile(file.id)} className="chip-remove" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="write-btn-group">
              <button type="button" onClick={() => setViewMode('list')} className="cancel-btn">
                취소
              </button>
              <button type="submit" className="submit-btn">
                등록하기
              </button>
            </div>
          </form>
        </main>
      )}
    </div>
  );
};

export default CommunityBoard;