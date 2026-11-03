import React, { useState } from 'react';
import { 
  Pin, 
  Paperclip, 
  ThumbsUp, 
  MessageSquare, 
  Trash2, 
  CornerDownRight, 
  Search, 
  X,
  FileText
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

const currentUser: User = {
  id: 'user123',
  name: '조우진',
  branch: '부산 서면점',
  role: 'ADMIN'
};

const initialPosts: Post[] = [
  {
    id: 9,
    category: '원두/재고',
    title: '232',
    content: '테스트 내용입니다.',
    author: '32',
    branch: '232',
    createdAt: '2026-08-01',
    views: 3,
    likes: 0,
    isPinned: false,
    attachments: [],
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

export const CommunityBoard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<Category>('전체');
  const [searchTarget, setSearchTarget] = useState<'all' | 'title' | 'author' | 'branch'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'write'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [newCategory, setNewCategory] = useState<Category>('원두/재고');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newIsPinned, setNewIsPinned] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<ProcessStatus>('접수중');
  const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);

  const [commentInput, setCommentInput] = useState<string>('');
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const newFiles: FileItem[] = filesArray.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      category: newCategory,
      title: newTitle,
      content: newContent,
      author: currentUser.name,
      branch: currentUser.branch,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      isPinned: currentUser.role === 'ADMIN' ? newIsPinned : false,
      status: newCategory === '원두/재고' ? newStatus : undefined,
      attachments: attachedFiles,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setAttachedFiles([]);
    setNewIsPinned(false);
    setViewMode('list');
  };

  const handleDeletePost = (postId: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== postId));
      setViewMode('list');
      setSelectedPostId(null);
    }
  };

  const handleStatusChange = (postId: number, newStatus: ProcessStatus) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, status: newStatus } : post));
  };

  const handleLikePost = (postId: number) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, likes: post.likes + 1 } : post));
  };

  const handleAddComment = (postId: number) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: currentUser.name,
      branch: currentUser.branch,
      content: commentInput,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
      parentId: replyTargetId
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));

    setCommentInput('');
    setReplyTargetId(null);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    
    let matchesSearch = true;
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      if (searchTarget === 'title') matchesSearch = post.title.toLowerCase().includes(kw);
      else if (searchTarget === 'author') matchesSearch = post.author.toLowerCase().includes(kw);
      else if (searchTarget === 'branch') matchesSearch = post.branch.toLowerCase().includes(kw);
      else matchesSearch = post.title.toLowerCase().includes(kw) || post.content.toLowerCase().includes(kw) || post.author.toLowerCase().includes(kw);
    }

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.id - a.id;
  });

  const selectedPost = posts.find(p => p.id === selectedPostId);

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
              {(['전체', '원두/재고', '물류/아이디어', '공지사항', '자유소통'] as Category[]).map(cat => (
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
                onChange={e => setSearchTarget(e.target.value as any)}
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
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
                <Search size={16} className="search-icon" />
              </div>

              <button
                onClick={() => setViewMode('write')}
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
                      setPosts(posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
                      setViewMode('detail');
                    }}
                    className={`post-row ${post.isPinned ? 'pinned-row' : ''}`}
                  >
                    <td className="col-num">
                      {post.isPinned ? <Pin size={16} className="pin-icon" /> : post.id}
                    </td>
                    {/* 가로 정렬되어 깔끔하게 나오는 분류/지점 영역 */}
                    <td className="col-category">
                      <div className="tag-group">
                        <span className="badge-category">{post.category}</span>
                        <span className="badge-branch">{post.branch}</span>
                      </div>
                    </td>
                    <td className="col-title">
                      <div className="title-flex">
                        {post.status && (
                          <span className={`status-badge ${post.status}`}>
                            [{post.status}]
                          </span>
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
            <button 
              onClick={() => setViewMode('list')}
              className="back-btn"
            >
              ← 목록으로 돌아가기
            </button>

            {(selectedPost.author === currentUser.name || currentUser.role === 'ADMIN') && (
              <button 
                onClick={() => handleDeletePost(selectedPost.id)}
                className="delete-btn"
              >
                <Trash2 size={14} /> 글 삭제하기
              </button>
            )}
          </div>

          <div className="detail-header-meta">
            <div className="badge-group">
              <span className="badge-category">{selectedPost.category}</span>
              <span className="badge-branch">{selectedPost.branch}</span>
              {selectedPost.status && (
                <select 
                  value={selectedPost.status}
                  onChange={e => handleStatusChange(selectedPost.id, e.target.value as ProcessStatus)}
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
              <div>작성자: <strong>{selectedPost.author}</strong> ({selectedPost.branch})</div>
              <div>등록일: {selectedPost.createdAt} | 조회수: {selectedPost.views}</div>
            </div>
          </div>

          <div className="detail-content">
            {selectedPost.content}
          </div>

          {selectedPost.attachments.length > 0 && (
            <div className="attachment-box">
              <h4><Paperclip size={14} /> 첨부파일 ({selectedPost.attachments.length})</h4>
              <div className="attachment-list">
                {selectedPost.attachments.map(file => (
                  <div key={file.id} className="attachment-item">
                    <FileText size={14} />
                    <span>{file.name}</span>
                    <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="like-section">
            <button
              onClick={() => handleLikePost(selectedPost.id)}
              className="like-action-btn"
            >
              <ThumbsUp size={16} /> 도움이 돼요! ({selectedPost.likes})
            </button>
          </div>

          <section className="comment-section">
            <h3><MessageSquare size={16} /> 댓글 ({selectedPost.comments.length})</h3>

            <div className="comment-list">
              {selectedPost.comments.filter(c => !c.parentId).map(comment => (
                <div key={comment.id} className="comment-item-box">
                  <div className="comment-meta">
                    <strong>{comment.author} ({comment.branch})</strong>
                    <span className="comment-date">{comment.createdAt}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  
                  <button
                    onClick={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}
                    className="reply-toggle-btn"
                  >
                    답글 달기
                  </button>

                  {selectedPost.comments.filter(reply => reply.parentId === comment.id).map(reply => (
                    <div key={reply.id} className="reply-item-box">
                      <CornerDownRight size={14} className="reply-arrow" />
                      <div className="reply-content-box">
                        <div className="comment-meta">
                          <strong>{reply.author} ({reply.branch})</strong>
                          <span className="comment-date">{reply.createdAt}</span>
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
                  <button onClick={() => setReplyTargetId(null)} className="cancel-reply-btn">취소</button>
                </div>
              )}
              <div className="comment-form-row">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="comment-input"
                />
                <button
                  onClick={() => handleAddComment(selectedPost.id)}
                  className="comment-submit-btn"
                >
                  등록
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {viewMode === 'write' && (
        <main className="write-card">
          <h2>✍️ 새 게시글 작성</h2>
          <form onSubmit={handleCreatePost} className="write-form">
            
            <div className="write-row">
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as Category)}
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
                onChange={e => setNewTitle(e.target.value)}
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
              <input
                type="text"
                value={`소속 지점: ${currentUser.branch}`}
                disabled
                className="write-disabled-input"
              />
            </div>

            {currentUser.role === 'ADMIN' && (
              <label className="pin-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={newIsPinned} 
                  onChange={e => setNewIsPinned(e.target.checked)} 
                />
                📌 중요 공지로 상단 고정 (Notice Pinning)
              </label>
            )}

            <textarea
              placeholder="내용을 입력하세요..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
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
                  {attachedFiles.map(file => (
                    <div key={file.id} className="preview-chip">
                      <span>{file.name}</span>
                      <X size={14} onClick={() => handleRemoveFile(file.id)} className="chip-remove" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="write-btn-group">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="cancel-btn"
              >
                취소
              </button>
              <button
                type="submit"
                className="submit-btn"
              >
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