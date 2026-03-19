import React from 'react';

interface HeaderProps {
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const getTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'projects': return 'Projects';
      case 'calendar': return 'Calendar';
      default: return 'FreelanceOS';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-title">{getTitle()}</div>
          <div className="breadcrumb">Home <i className="fa-solid fa-chevron-right" style={{ fontSize: '9px' }}></i> <span>{getTitle()}</span></div>
        </div>
      </div>
      <div className="header-right">
        <button className="header-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
        <button className="header-btn">
          <i className="fa-solid fa-bell"></i>
          <span className="notif-dot"></span>
        </button>
        <button className="header-btn"><i className="fa-solid fa-sun"></i></button>
        <div className="header-avatar">JD</div>
      </div>
    </header>
  );
};

export default Header;
