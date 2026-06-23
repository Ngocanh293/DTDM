import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileShow, setIsMobileShow] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileShow(!isMobileShow);
  const closeMobileSidebar = () => setIsMobileShow(false);

  return (
    <>
      <div 
        id="overlay" 
        className={`overlay ${isMobileShow ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      ></div>
      
      <Topbar 
        toggleSidebar={toggleSidebar} 
        toggleMobileSidebar={toggleMobileSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileShow={isMobileShow} 
      />
      
      <main id="content" className={`content py-10 ${isSidebarCollapsed ? 'full' : ''}`}>
        <Outlet />
        
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <footer className="text-center py-2 mt-6 text-secondary">
                <p className="mb-0">
                  Copyright © 2026 InApp Inventory Dashboard. Developed by <a href="https://codescandy.com/" target="_blank" rel="noreferrer" className="text-primary">CodesCandy</a> • Distributed by <a href="https://themewagon.com/" target="_blank" rel="noreferrer" className="text-primary">ThemeWagon</a>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
