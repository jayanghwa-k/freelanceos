import React from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, currentPage, setCurrentPage }) => {

  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">F</div>
          <div className="logo-text">Freelance<span>OS</span></div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main</div>
          <a 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} 
            href="#" 
            onClick={(e) => { e.preventDefault(); setCurrentPage('dashboard'); }}
          >
            <i className="fa-solid fa-gauge-high"></i>
            <span className="nav-tooltip">Dashboard</span>
            <span className="nav-item-label">Dashboard</span>
          </a>
          <a 
            className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`} 
            href="#" 
            onClick={(e) => { e.preventDefault(); setCurrentPage('projects'); }}
          >
            <i className="fa-solid fa-folder-open"></i>
            <span className="nav-tooltip">Projects</span>
            <span className="nav-item-label">Projects</span>
            <span className="nav-badge">4</span>
          </a>
          <a 
            className={`nav-item ${currentPage === 'calendar' ? 'active' : ''}`} 
            href="#" 
            onClick={(e) => { e.preventDefault(); setCurrentPage('calendar'); }}
          >
            <i className="fa-solid fa-calendar-days"></i>
            <span className="nav-tooltip">Calendar</span>
            <span className="nav-item-label">Calendar</span>
          </a>

          <div className="nav-section-title">Finance</div>
          <a className="nav-item" href="#"><i className="fa-solid fa-file-invoice-dollar"></i><span className="nav-tooltip">Invoices</span><span className="nav-item-label">Invoices</span><span className="nav-badge warning">2</span></a>
          <a className="nav-item" href="#"><i className="fa-solid fa-chart-line"></i><span className="nav-tooltip">Revenue</span><span className="nav-item-label">Revenue</span></a>

          <div className="nav-section-title">Clients</div>
          <a className="nav-item" href="#"><i className="fa-solid fa-users"></i><span className="nav-tooltip">Clients</span><span className="nav-item-label">Clients</span></a>
          <a className="nav-item" href="#"><i className="fa-solid fa-envelope"></i><span className="nav-tooltip">Messages</span><span className="nav-item-label">Messages</span></a>

          <div className="nav-section-title">Settings</div>
          <a className="nav-item" href="#"><i className="fa-solid fa-gear"></i><span className="nav-tooltip">Settings</span><span className="nav-item-label">Settings</span></a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">JD</div>
            <div className="user-info">
              <div className="user-name">John Doe</div>
              <div className="user-role">Freelancer</div>
            </div>
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </div>
        </div>
      </aside>
      <button 
        className="sidebar-toggle" 
        id="sidebarToggle" 
        onClick={toggleSidebar} 
        title="사이드바 접기/펼치기"
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} id="toggleIcon"></i>
      </button>
    </>
  );
};

export default Sidebar;
