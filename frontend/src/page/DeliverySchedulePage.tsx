import React, { useState } from 'react';
import './DeliverySchedulePage.css';

interface ScheduleItem {
  id: number;
  date: string;
  branch: string;
  driver: string;
  status: '배송중' | '배송완료' | '출발대기';
  note: string;
}

export default function DeliverySchedulePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  const [selectedDate, setSelectedDate] = useState<string>('2026-11-04');
  const [formDate, setFormDate] = useState<string>('2026-11-04');
  const [newBranch, setNewBranch] = useState<string>('부산 서면점');
  const [newNote, setNewNote] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: 1, date: '2026-11-04', branch: '부산 서면점', driver: '김기사 (부산 1호차)', status: '배송완료', note: '오전 10시 원두 및 시럽 납품 완료' },
    { id: 2, date: '2026-11-04', branch: '부산 센텀점', driver: '박기사 (부산 2호차)', status: '배송중', note: '버터떡 세트 긴급 물류 배송 중' },
    { id: 3, date: '2026-11-05', branch: '해운대 신도시점', driver: '이기사 (경남 1호차)', status: '출발대기', note: '정기 부자재 및 우유 입고 예정' },
    { id: 4, date: '2026-11-06', branch: '부산 남포점', driver: '김기사 (부산 1호차)', status: '출발대기', note: '매장 정기 세스코 방역 소독일 (배송 시간 조정)' },
  ]);

  const years = Array.from({ length: 41 }, (_, i) => 2000 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // 대한민국 주요 고정 및 주요 공휴일 판별 함수 (음력 변환 근사치 또는 고정일 포함)
  const getHolidayName = (year: number, month: number, day: number): string | null => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const md = `${mm}-${dd}`;

    // 1. 고정 양력 공휴일
    const fixedHolidays: { [key: string]: string } = {
      '01-01': '신정',
      '03-01': '삼일절',
      '05-05': '어린이날',
      '06-06': '현충일',
      '08-15': '광복절',
      '10-03': '개천절',
      '10-09': '한글날',
      '12-25': '성탄절',
    };

    if (fixedHolidays[md]) {
      return fixedHolidays[md];
    }

    // 2. 2026년 기준 주요 음력 명절(설날, 부처님오신날, 추석) 날짜 매핑 예시
    if (year === 2026) {
      if (md === '02-16' || md === '02-17' || md === '02-18') return '설날 연휴';
      if (md === '05-24') return '부처님오신날';
      if (md === '09-24' || md === '09-25' || md === '09-26') return '추석 연휴';
    } else if (year === 2025) {
      if (md === '01-28' || md === '01-29' || md === '01-30') return '설날 연휴';
      if (md === '05-05') return '어린이날/부처님';
      if (md === '10-05' || md === '10-06' || md === '10-07') return '추석 연휴';
    }

    return null;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNote) return;

    if (editingId !== null) {
      setSchedules(schedules.map(item => 
        item.id === editingId 
          ? { ...item, date: formDate, branch: newBranch, note: newNote }
          : item
      ));
      alert('스케줄이 성공적으로 수정되었습니다.');
      setEditingId(null);
    } else {
      const newItem: ScheduleItem = {
        id: Date.now(),
        date: formDate,
        branch: newBranch,
        driver: '배송 담당자 미배정',
        status: '출발대기',
        note: newNote,
      };
      setSchedules([...schedules, newItem]);
      alert(`${formDate} 날짜에 새로운 배송 및 지점 스케줄이 등록되었습니다.`);
    }

    setNewNote('');
  };

  const handleStartEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setFormDate(item.date);
    setNewBranch(item.branch);
    setNewNote(item.note);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewNote('');
  };

  const handleDeleteSchedule = (id: number) => {
    if (window.confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      setSchedules(schedules.filter(item => item.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
      alert('스케줄이 삭제되었습니다.');
    }
  };

  const filteredSchedules = schedules.filter((s: ScheduleItem) => s.date === selectedDate);

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = String(selectedMonth).padStart(2, '0');
    const formattedDay = String(dayNumber).padStart(2, '0');
    const fullDate = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(fullDate);
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📅 전국 지점별 물류 배송 스케줄 및 캘린더</h2>
        <p>전국 26개 지점의 배송 차량 운행 현황과 지점별 특이사항(휴무일·방역일)을 실시간 공유합니다.</p>
        <div className="schedule-title-line"></div>
      </div>

      <div className="schedule-content-layout">
        <div className="calendar-card">
          <div className="calendar-top">
            <div className="date-picker-group">
              <div className="select-wrapper">
                <select
                  value={selectedYear}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedYear(Number(e.target.value))}
                  className="pretty-select"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>

              <div className="select-wrapper">
                <select
                  value={selectedMonth}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(Number(e.target.value))}
                  className="pretty-select"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="badge-sub">날짜를 클릭해 일정을 확인하세요</span>
          </div>

          <div className="calendar-grid">
            {/* 요일 헤더 (일요일 빨간색, 토요일 파란색) */}
            {['일', '월', '화', '수', '목', '금', '토'].map((w: string, idx: number) => {
              let headerClass = "calendar-weekday";
              if (idx === 0) headerClass += " sun-weekday";
              if (idx === 6) headerClass += " sat-weekday";
              return (
                <div key={idx} className={headerClass}>{w}</div>
              );
            })}

            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-day empty"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedMonth = String(selectedMonth).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const fullDateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

              // 요일 계산 (0: 일요일, 6: 토요일)
              const currentDayOfWeek = new Date(selectedYear, selectedMonth - 1, dayNum).getDay();
              const holidayName = getHolidayName(selectedYear, selectedMonth, dayNum);

              const hasEvent = schedules.some((s: ScheduleItem) => s.date === fullDateStr);
              const isSelected = selectedDate === fullDateStr;

              // 클래스 동적 할당 (일요일 또는 공휴일은 빨간색, 토요일은 파란색)
              let dayClass = "calendar-day";
              if (isSelected) dayClass += " selected";
              if (hasEvent) dayClass += " has-event";
              if (currentDayOfWeek === 0 || holidayName) {
                dayClass += " sun-date"; // 빨간색 날짜
              } else if (currentDayOfWeek === 6) {
                dayClass += " sat-date"; // 파란색 날짜
              }

              return (
                <div
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={dayClass}
                  title={holidayName ? holidayName : ''}
                >
                  <span className="day-number">{dayNum}</span>
                  {holidayName && <span className="holiday-label">{holidayName}</span>}
                  {hasEvent && <span className="event-dot"></span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="schedule-detail-card">
          <div className="detail-header">
            <h3>📍 {selectedDate} 상세 배송 현황</h3>
            <span className="date-badge">{filteredSchedules.length}개의 일정</span>
          </div>

          <div className="schedule-list">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((item: ScheduleItem) => (
                <div key={item.id} className="schedule-item-box">
                  <div className="item-top-row">
                    <strong>{item.branch}</strong>
                    <div className="schedule-action-group">
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="btn-item-edit"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="btn-item-delete"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="driver-info">👤 담당: {item.driver}</p>
                  <p className="note-text">📝 {item.note}</p>
                </div>
              ))
            ) : (
              <div className="no-schedule">해당 날짜에 등록된 배송 스케줄이 없습니다.</div>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="schedule-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>
                {editingId !== null ? '✏️ 지점 스케줄 수정하기' : '➕ 지점 특이사항 및 배송 일정 추가'}
              </h4>
              {editingId !== null && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  style={{ background: '#8d7967', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                >
                  수정 취소
                </button>
              )}
            </div>

            <div className="form-row">
              <input
                type="date"
                value={formDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <select
                value={newBranch}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewBranch(e.target.value)}
                className="pretty-select width-full"
              >
                <option value="부산 서면점">부산 서면점</option>
                <option value="부산 센텀점">부산 센텀점</option>
                <option value="부산 남포점">부산 남포점</option>
                <option value="해운대 신도시점">해운대 신도시점</option>
                <option value="동래 온천천점">동래 온천천점</option>
              </select>
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="예: 물류 배송 완료 / 방역 작업 / 휴무일 지정"
                value={newNote}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(e.target.value)}
                className="form-input"
              />
            </div>
            <button 
              type="submit" 
              className="form-submit-btn"
              style={{ backgroundColor: editingId !== null ? '#c7a75c' : '#4e3629' }}
            >
              {editingId !== null ? '스케줄 수정 완료' : '일정 등록하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}