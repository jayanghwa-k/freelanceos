import React from 'react';

const Calendar: React.FC = () => {
  return (
    <div className="calendar-page">
      <div className="page-header">
        <div className="page-title">캘린더</div>
        <div className="page-subtitle">일정 및 마감 기한을 확인하세요.</div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="full-calendar-placeholder" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-regular fa-calendar-days" style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }}></i>
            <p>캘린더 기능이 준비 중입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
