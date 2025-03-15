import React from "react";


const Header = () => {
  // Hardcoded user data (replace with props or API data if needed)
  const user = {
    name: "Ruella Malabo Jr.",
    role: "Admin",
    profilePic: "/imgs/profile-pic.jpg", // Replace with the path to your profile picture
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="user-info">
          <div className="icon-wrapper">
            <img
              src="/imgs/bell-icon.svg" // Replace with your notification bell icon
              alt="Notifications"
              className="notification-icon"
            />
            <span className="badge">7</span> {/* Notification badge */}
          </div>
          <img
            src={user.profilePic}
            alt="Profile"
            className="profile-pic"
            onError={(e) => (e.target.src = "/imgs/default-profile.jpg")} // Fallback image
          />
          <div className="user-details">
            <div className="user-name-wrapper">
              <h2 className="user-name">{user.name}</h2>
              <img
                src="/imgs/dropdown-arrow.svg" // Replace with your dropdown arrow icon
                alt="Dropdown"
                className="dropdown-arrow"
              />
            </div>
            <p className="user-role">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;