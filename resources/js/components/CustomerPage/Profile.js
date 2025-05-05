import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet for nested routes
import Header from '../HeaderContent/Header';
import ProfileSidebar from './ProfileSidebar';

const Profile = () => {
  return (
    <div className="profile">
      <Header />
      <div className="profile-content">
        <h2 className="profile-title">Account Settings</h2>
        <div className="profile-layout">
          <ProfileSidebar />
          <div className="profile-main-content">
            <Outlet /> {/* Render nested route components */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;