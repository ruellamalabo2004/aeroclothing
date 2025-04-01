import React, { useState, useEffect } from "react";

export default function AccountSettings() {
  const [adminInfo, setAdminInfo] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    profile_pic: '/imgs/profile.svg',
    role: 'Admin',
  });
  const [passwordInfo, setPasswordInfo] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [imagePreview, setImagePreview] = useState('/imgs/profile.svg');
  const [newProfileImage, setNewProfileImage] = useState(null);
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  // Fetch admin information
  const fetchAdminInfo = async () => {
    console.log('AccountSettings component mounted. Checking token...');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/api/profile", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      const profileData = data.profile || data;
      const userData = data.user || data;

      const fetchedInfo = {
        first_name: profileData.first_name || '',
        middle_name: profileData.middle_name || '',
        last_name: profileData.last_name || '',
        suffix: profileData.suffix || '',
        email: userData.email || '',
        profile_pic: profileData.profile_pic
          ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
          : '/imgs/profile.svg',
        role: userData.role || profileData.role || 'Admin',
      };

      setAdminInfo(fetchedInfo);
      setImagePreview(fetchedInfo.profile_pic);
    } catch (err) {
      console.error('Fetch Admin Info Error:', err);
      setError(err.message || "Failed to load account information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setAdminInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidFile(file)) {
      setNewProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file (PNG, JPG, JPEG, GIF) under 2MB.");
    }
  };

  const isValidFile = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  // Save profile updates
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const formData = new FormData();
    formData.append('first_name', adminInfo.first_name);
    formData.append('middle_name', adminInfo.middle_name);
    formData.append('last_name', adminInfo.last_name);
    formData.append('suffix', adminInfo.suffix);
    formData.append('email', adminInfo.email);
    
    if (newProfileImage) {
      formData.append('profile_image', newProfileImage);
    }
    formData.append('_method', 'PUT');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/api/update-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      console.log("Updated Profile Data:", updatedData);

      setAdminInfo((prev) => ({
        ...prev,
        first_name: updatedData.profile?.first_name || updatedData.first_name || prev.first_name,
        middle_name: updatedData.profile?.middle_name || updatedData.middle_name || prev.middle_name,
        last_name: updatedData.profile?.last_name || updatedData.last_name || prev.last_name,
        suffix: updatedData.profile?.suffix || updatedData.suffix || prev.suffix,
        email: updatedData.user?.email || updatedData.email || prev.email,
        profile_pic: updatedData.profile?.profile_pic
          ? `${BASE_IMAGE_URL}/${updatedData.profile.profile_pic}`
          : prev.profile_pic,
      }));

      setImagePreview(
        updatedData.profile?.profile_pic
          ? `${BASE_IMAGE_URL}/${updatedData.profile.profile_pic}`
          : adminInfo.profile_pic
      );
      setNewProfileImage(null);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Save Profile Error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      if (err.message.includes("token") || err.message.includes("expired")) {
        localStorage.removeItem("token");
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save password changes
  const handleSavePassword = async () => {
    setIsSavingPassword(true);
    setPasswordError(null);

    if (passwordInfo.new_password !== passwordInfo.confirm_password) {
      setPasswordError("New password and confirmation do not match.");
      setIsSavingPassword(false);
      return;
    }

    const formData = new FormData();
    formData.append('current_password', passwordInfo.current_password);
    formData.append('new_password', passwordInfo.new_password);
    formData.append('new_password_confirmation', passwordInfo.confirm_password);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch("http://127.0.0.1:8000/api/change-password", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(errorData.message || "Failed to change password");
      }

      await response.json(); // Assuming success response doesn't need to update state
      setPasswordInfo({ current_password: '', new_password: '', confirm_password: '' });
      alert('Password changed successfully!');
    } catch (err) {
      console.error('Save Password Error:', err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
      if (err.message.includes("token") || err.message.includes("expired")) {
        localStorage.removeItem("token");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  return (
    <main className="account-settings">
      <h1>Account Settings</h1>
      <div className="settings-wrapper">
        <div className="account-settings-container">
          {loading ? (
            <p>Loading account information...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : adminInfo ? (
            <div className="admin-info">
              <h2>Admin Profile</h2>
              <div className="info-section">
                <div className="info-item">
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="first_name"
                    value={adminInfo.first_name}
                    onChange={handleProfileChange}
                    disabled={loading || isSavingProfile}
                  />
                </div>
                <div className="info-item">
                  <label>Middle Name:</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={adminInfo.middle_name}
                    onChange={handleProfileChange}
                    disabled={loading || isSavingProfile}
                  />
                </div>
                <div className="info-item">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={adminInfo.last_name}
                    onChange={handleProfileChange}
                    disabled={loading || isSavingProfile}
                  />
                </div>
                <div className="info-item">
                  <label>Suffix:</label>
                  <input
                    type="text"
                    name="suffix"
                    value={adminInfo.suffix}
                    onChange={handleProfileChange}
                    disabled={loading || isSavingProfile}
                  />
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={adminInfo.email}
                    onChange={handleProfileChange}
                    disabled={loading || isSavingProfile}
                  />
                </div>
                <div className="info-item">
                  <label>Profile Picture:</label>
                  <div className="profile-pic-container">
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="profile-pic"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                    <input
                      type="file"
                      name="profile_pic"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || isSavingProfile}
                    />
                  </div>
                </div>
                <div className="info-item">
                  <label>Role:</label>
                  <span>{adminInfo.role}</span>
                </div>
              </div>
              <button
                className="save-button"
                onClick={handleSaveProfile}
                disabled={loading || isSavingProfile}
              >
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : (
            <p>No account information available.</p>
          )}
        </div>

        <div className="change-password-container">
          <h2>Change Password</h2>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <div className="password-section">
            <div className="password-item">
              <label>Current Password:</label>
              <input
                type="password"
                name="current_password"
                value={passwordInfo.current_password}
                onChange={handlePasswordChange}
                disabled={loading || isSavingPassword}
              />
            </div>
            <div className="password-item">
              <label>New Password:</label>
              <input
                type="password"
                name="new_password"
                value={passwordInfo.new_password}
                onChange={handlePasswordChange}
                disabled={loading || isSavingPassword}
              />
            </div>
            <div className="password-item">
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="confirm_password"
                value={passwordInfo.confirm_password}
                onChange={handlePasswordChange}
                disabled={loading || isSavingPassword}
              />
            </div>
          </div>
          <button
            className="save-button"
            onClick={handleSavePassword}
            disabled={loading || isSavingPassword}
          >
            {isSavingPassword ? "Saving..." : "Save Password"}
          </button>
        </div>
      </div>
    </main>
  );
}