import { useState } from 'react';
import './InventoryManagementPage.css';

interface LogItem {
  id: number;
  date: string;
  branch: string;
  item: string;
  type: '입고' | '출고';
  quantity: number;
  status: '승인대기' | '승인완료' | '반려';
}

export default function InventoryManagementPage() {
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 1, date: '2026-11-04 10:30', branch: '부산 서면점', item: '맛있는 버터떡 1', type: '출고', quantity: 50, status: '승인완료' },
    { id: 2, date: '2026-11-04 09:15', branch: '부산 센텀점', item: '스페셜 원두 1kg', type: '입고', quantity: 20, status: '승인대기' },
    { id: 3, date: '2026-11-03 16:40', branch: '부산 남포점', item: '맛있는 버터떡 1', type: '출고', quantity: 30, status: '반려' },
    { id: 4, date: '2026-11-03 14:20', branch: '해운대 신도시점', item: '우유 10L', type: '입고', quantity: 40, status: '승인완료' },
  ]);

  const [filterType, setFilterType] = useState<'전체' | '입고' | '출고'>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusChange = (id: number, newStatus: '승인완료' | '반려') => {
    setLogs(logs.map(log => log.id === id ? { ...log, status: newStatus } : log));
    alert(`해당 물류 요청이 [${newStatus}] 처리되었습니다.`);
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === '전체' || log.type === filterType;
    const matchesSearch = log.branch.includes(searchTerm) || log.item.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  return (
    <div className="scm-container">
      <div className="scm-header">
        <h2>📦 실시간 입출고 내역 및 SCM 공급망 관리</h2>
        <p>전국 지점의 물품 이동 히스토리를 추적하고 입출고 승인 상태를 관리합니다.</p>
        <div className="scm-title-line"></div>
      </div>

      <div className="scm-filter-bar">
        <div className="scm-filter-btns">
          {(['전체', '입고', '출고'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`scm-btn-tab ${filterType === type ? 'active' : ''}`}
            >
              {type} 내역
            </button>
          ))}
        </div>
        <div>
          <input
            type="text"
            placeholder="지점명 또는 품목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="scm-search-input"
          />
        </div>
      </div>

      <div className="scm-table-wrapper">
        <table className="scm-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>요청 일시</th>
              <th>요청 지점</th>
              <th>품목명</th>
              <th>구분</th>
              <th>수량</th>
              <th>처리 상태</th>
              <th className="text-center">관리 조치</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="fw-bold">{log.id}</td>
                <td className="text-muted">{log.date}</td>
                <td className="fw-bold">{log.branch}</td>
                <td>{log.item}</td>
                <td>
                  <span className={`badge-type ${log.type === '입고' ? 'in' : 'out'}`}>
                    {log.type}
                  </span>
                </td>
                <td className="fw-bold">{log.quantity}개</td>
                <td>
                  <span className={`status-text ${log.status}`}>
                    ● {log.status}
                  </span>
                </td>
                <td className="text-center">
                  {log.status === '승인대기' ? (
                    <div className="action-btns">
                      <button onClick={() => handleStatusChange(log.id, '승인완료')} className="btn-approve">승인</button>
                      <button onClick={() => handleStatusChange(log.id, '반려')} className="btn-reject">반려</button>
                    </div>
                  ) : (
                    <span className="text-muted small">처리 완료됨</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}