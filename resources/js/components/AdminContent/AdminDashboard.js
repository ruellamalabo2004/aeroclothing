import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isOpen]);

  return (
    <div className="admin-dashboard">
      <AdminSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`admin-dashboard__wrapper ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <AdminHeader toggleSidebar={toggleSidebar} isOpen={isOpen} />
        <main className="admin-dashboard__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;