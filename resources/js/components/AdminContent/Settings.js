import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Eye, EyeOff, Upload, ChevronDown } from 'lucide-react';
import AdminSettings from './AdminSettings';


const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    role: '',
    gender: '',
    date_of_birth: '',
    profile_image: null,
  });
  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [imagePreview, setImagePreview] = useState('/imgs/profile.svg');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  // Fetch profile information
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching profile with token:', token);
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Profile response:', response.data);
        const profileData = response.data.profile || response.data;
        const userData = response.data.user || response.data;

        const fetchedProfile = {
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: userData.email || '',
          role: userData.role || profileData.role || '',
          gender: profileData.gender || '',
          date_of_birth: profileData.date_of_birth || '',
          profile_image: null,
        };

        setProfile(fetchedProfile);
        setImagePreview(
          profileData.profile_pic
            ? `${BASE_IMAGE_URL}/${profileData.profile_pic}`
            : '/imgs/profile.svg'
        );
      } catch (error) {
        console.error('Failed to fetch profile:', error.response?.data || error.message);
        setErrors({ general: error.message || 'Failed to load profile information. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handleDateSelect = (date) => {
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    setProfile({ ...profile, date_of_birth: formattedDate });
    setShowCalendar(false);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validTypes.includes(file.type) || file.size > maxSize) {
      setErrors({ general: 'Please select a valid image file (PNG, JPG, JPEG, GIF) under 2MB.' });
      return;
    }

    setProfile({ ...profile, profile_image: file });

    // Set image preview immediately
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEditProfile = (e) => {
    e.preventDefault(); // Prevent any form submission
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancelEdit = (e) => {
    e.preventDefault(); // Prevent any form submission
    setIsEditing(false);
    // Optionally reset any unsaved changes
    // You could store original values and restore them here
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrors({});
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('first_name', profile.first_name);
    formData.append('middle_name', profile.middle_name);
    formData.append('last_name', profile.last_name);
    formData.append('suffix', profile.suffix);
    formData.append('email', profile.email);
    formData.append('role', profile.role);
    formData.append('gender', profile.gender);
    formData.append('date_of_birth', profile.date_of_birth);
    if (profile.profile_image) {
      formData.append('profile_image', profile.profile_image);
    }
    formData.append('_method', 'PUT');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      console.log('Updating profile with data:', Object.fromEntries(formData));
      const response = await axios.post('http://127.0.0.1:8000/api/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('Update profile response:', response.data);
      setSuccessMessage(response.data.message || 'Profile updated successfully');
      setProfile({
        ...profile,
        first_name: response.data.profile?.first_name || profile.first_name,
        middle_name: response.data.profile?.middle_name || profile.middle_name,
        last_name: response.data.profile?.last_name || profile.last_name,
        suffix: response.data.profile?.suffix || profile.suffix,
        email: response.data.user?.email || profile.email,
        role: response.data.user?.role || response.data.profile?.role || profile.role,
        gender: response.data.profile?.gender || profile.gender,
        date_of_birth: response.data.profile?.date_of_birth || profile.date_of_birth,
        profile_image: null,
      });

      // Update image preview from response
      setImagePreview(
        response.data.profile?.profile_pic
          ? `${BASE_IMAGE_URL}/${response.data.profile.profile_pic}?t=${Date.now()}`
          : '/imgs/profile.svg'
      );

      // Return to read-only mode
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error.response?.data || error.message);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data.message || 'Failed to update profile' });
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setErrors({});
    setSuccessMessage('');

    if (password.new_password !== password.confirm_password) {
      setErrors({ confirm_password: ['Passwords do not match'] });
      setIsSavingPassword(false);
      return;
    }

    const formData = new FormData();
    formData.append('current_password', password.current_password);
    formData.append('new_password', password.new_password);
    formData.append('new_password_confirmation', password.confirm_password);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      console.log('Changing password with data:', Object.fromEntries(formData));
      const response = await axios.post('http://127.0.0.1:8000/api/change-password', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('Change password response:', response.data);
      setSuccessMessage(response.data.message || 'Password changed successfully');
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Failed to change password:', error.response?.data || error.message);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data.message || 'Failed to change password' });
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Simple calendar component
  const SimpleCalendar = ({ onSelect }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const days = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    const prevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const renderDays = () => {
      const dayElements = [];
      for (let i = 0; i < firstDay; i++) {
        dayElements.push(<div key={`empty-${i}`} className="calendar__day empty"></div>);
      }
      for (let i = 1; i <= days; i++) {
        const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        dayElements.push(
          <div
            key={`day-${i}`}
            className={`calendar__day ${dayDate <= today ? 'selectable' : 'disabled'}`}
            onClick={() => dayDate <= today ? onSelect(dayDate) : null}
          >
            {i}
          </div>
        );
      }
      return dayElements;
    };

    return (
      <div className="calendar">
        <div className="calendar__header">
          <button onClick={prevMonth}>{"<"}</button>
          <div>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
          <button onClick={nextMonth}>{">"}</button>
        </div>
        <div className="calendar__weekdays">
          <div>Su</div>
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
        </div>
        <div className="calendar__days">
          {renderDays()}
        </div>
      </div>
    );
  };

  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>
      <div className="settings__tabs">
        <button
          className={`settings__tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`settings__tab ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Settings
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="settings__content">
          {isLoading && <div className="settings__loading">Loading profile...</div>}
          {successMessage && <div className="settings__success">{successMessage}</div>}
          {errors.general && <div className="settings__error">{errors.general}</div>}
          <div className="settings__section settings__section--boxed">
            <h2 className="settings__section-title">Profile Information</h2>
            <div className="settings__profile-photo">
              <div className="settings__photo-placeholder">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="settings__photo-preview"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                  id="profile-photo-upload"
                  disabled={isLoading || isSavingProfile || !isEditing}
                />
                <label htmlFor="profile-photo-upload" className="settings__photo-label">
                  <div className="settings__upload-overlay">
                    <Upload size={18} className="settings__upload-icon" />
                  </div>
                </label>
              </div>
            </div>
            <form className="settings__form">
              <div className="settings__form-row">
                <div className="settings__form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                    disabled={isLoading || isSavingProfile || !isEditing}
                  />
                  {errors.first_name && <span className="settings__error">{errors.first_name[0]}</span>}
                </div>
                <div className="settings__form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    placeholder="Middle name"
                    value={profile.middle_name}
                    onChange={handleProfileChange}
                    disabled={isLoading || isSavingProfile || !isEditing}
                  />
                  {errors.middle_name && <span className="settings__error">{errors.middle_name[0]}</span>}
                </div>
              </div>
              <div className="settings__form-row">
                <div className="settings__form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                    disabled={isLoading || isSavingProfile || !isEditing}
                  />
                  {errors.last_name && <span className="settings__error">{errors.last_name[0]}</span>}
                </div>
                <div className="settings__form-group">
                  <label>Suffix</label>
                  <input
                    type="text"
                    name="suffix"
                    placeholder="Suffix (e.g., Jr., Sr.)"
                    value={profile.suffix}
                    onChange={handleProfileChange}
                    disabled={isLoading || isSavingProfile || !isEditing}
                  />
                  {errors.suffix && <span className="settings__error">{errors.suffix[0]}</span>}
                </div>
              </div>
              <div className="settings__form-row">
                <div className="settings__form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={profile.email}
                    onChange={handleProfileChange}
                    disabled={isLoading || isSavingProfile || !isEditing}
                  />
                  {errors.email && <span className="settings__error">{errors.email[0]}</span>}
                </div>
                <div className="settings__form-group settings__form-group--with-icon">
                  <label>Role</label>
                  <div className="settings__input-wrapper">
                    <select
                      name="role"
                      value={profile.role}
                      onChange={handleProfileChange}
                      disabled={isLoading || isSavingProfile || !isEditing}
                      className="settings__dropdown"
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="settings__input-icon"
                    />
                  </div>
                  {errors.role && <span className="settings__error">{errors.role[0]}</span>}
                </div>
              </div>
              <div className="settings__form-row">
                <div className="settings__form-group settings__form-group--with-icon">
                  <label>Gender</label>
                  <div className="settings__input-wrapper">
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      disabled={isLoading || isSavingProfile || !isEditing}
                      className="settings__dropdown"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="settings__input-icon"
                    />
                  </div>
                  {errors.gender && <span className="settings__error">{errors.gender[0]}</span>}
                </div>
                <div className="settings__form-group settings__form-group--with-icon">
                  <label>Date of Birth</label>
                  <div className="settings__input-wrapper">
                    <input
                      type="text"
                      name="date_of_birth"
                      placeholder="mm/dd/yyyy"
                      value={profile.date_of_birth}
                      onChange={handleProfileChange}
                      disabled={isLoading || isSavingProfile || !isEditing}
                    />
                    <Calendar
                      size={16}
                      className="settings__input-icon"
                      onClick={isEditing ? toggleCalendar : null}
                    />
                    {showCalendar && isEditing && (
                      <div className="settings__calendar-popup">
                        <SimpleCalendar onSelect={handleDateSelect} />
                      </div>
                    )}
                  </div>
                  {errors.date_of_birth && <span className="settings__error">{errors.date_of_birth[0]}</span>}
                </div>
              </div>
              <div className="settings__form-actions">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="settings__submit-button"
                      onClick={handleUpdateProfile}
                      disabled={isLoading || isSavingProfile}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="settings__cancel-button"
                      onClick={handleCancelEdit}
                      disabled={isLoading || isSavingProfile}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="settings__submit-button"
                    onClick={handleEditProfile}
                    disabled={isLoading}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="settings__section settings__section--boxed">
            <h2 className="settings__section-title">Change Password</h2>
            <form onSubmit={handleChangePassword} className="settings__form">
              <div className="settings__form-group settings__form-group--with-icon">
                <label>Current Password</label>
                <div className="settings__input-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="current_password"
                    placeholder="Current Password"
                    value={password.current_password}
                    onChange={handlePasswordChange}
                    disabled={isLoading || isSavingPassword}
                  />
                  <div className="settings__password-toggle">
                    {showCurrentPassword ? (
                      <EyeOff
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleCurrentPassword}
                      />
                    ) : (
                      <Eye
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleCurrentPassword}
                      />
                    )}
                  </div>
                </div>
                {errors.current_password && <span className="settings__error">{errors.current_password[0]}</span>}
              </div>
              <div className="settings__form-group settings__form-group--with-icon">
                <label>New Password</label>
                <div className="settings__input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="new_password"
                    placeholder="New Password"
                    value={password.new_password}
                    onChange={handlePasswordChange}
                    disabled={isLoading || isSavingPassword}
                  />
                  <div className="settings__password-toggle">
                    {showNewPassword ? (
                      <EyeOff
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleNewPassword}
                      />
                    ) : (
                      <Eye
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleNewPassword}
                      />
                    )}
                  </div>
                </div>
                {errors.new_password && <span className="settings__error">{errors.new_password[0]}</span>}
              </div>
              <div className="settings__form-group settings__form-group--with-icon">
                <label>Confirm New Password</label>
                <div className="settings__input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    placeholder="Confirm New Password"
                    value={password.confirm_password}
                    onChange={handlePasswordChange}
                    disabled={isLoading || isSavingPassword}
                  />
                  <div className="settings__password-toggle">
                    {showConfirmPassword ? (
                      <EyeOff
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleConfirmPassword}
                      />
                    ) : (
                      <Eye
                        size={16}
                        className="settings__input-icon"
                        onClick={toggleConfirmPassword}
                      />
                    )}
                  </div>
                </div>
                {errors.confirm_password && <span className="settings__error">{errors.confirm_password[0]}</span>}
              </div>
              <div className="settings__form-actions">
                <button
                  type="submit"
                  className="settings__submit-button"
                  disabled={isLoading || isSavingPassword}
                >
                  {isSavingPassword ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'admin' && <AdminSettings />}
    </div>
  );
};

export default Settings;