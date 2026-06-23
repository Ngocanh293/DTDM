import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeTopbar from './EmployeeTopbar';

export default function EmployeeLayout() {
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
      
      <EmployeeTopbar 
        toggleSidebar={toggleSidebar} 
        toggleMobileSidebar={toggleMobileSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      <EmployeeSidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileShow={isMobileShow} 
      />
      
      <main id="content" className={`content py-10 ${isSidebarCollapsed ? 'full' : ''}`}>
        <div className="container-fluid py-4 min-vh-100">
           <Outlet />
        </div>
        
        <footer className="text-center py-4 text-secondary mt-auto border-top">
           <p className="mb-0">
             © 2026 PCeStore Team • Phân hệ Vận hành Nhân viên
           </p>
        </footer>
      </main>
    </>
  );
}
