import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="main">
        <Header currentPage={currentPage} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
