import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Eye, EyeOff, Upload, Pencil, ChevronDown } from 'lucide-react';

const ProfileDetails = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false); // New state for password editing
  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
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

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }

        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const profileData = response.data.profile || response.data;
        const userData = response.data.user || response.data;

        const fetchedProfile = {
          first_name: profileData.first_name || '',
          middle_name: profileData.middle_name || '',
          last_name: profileData.last_name || '',
          suffix: profileData.suffix || '',
          email: userData.email || '',
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
        setErrors({ general: error.message || 'Failed to load profile information.' });
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
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const maxSize = 2 * 1024 * 1024;
    if (!validTypes.includes(file.type) || file.size > maxSize) {
      setErrors({ general: 'Please select a valid image file (PNG, JPG, JPEG, GIF) under 2MB.' });
      return;
    }

    setProfile({ ...profile, profile_image: file });
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEditProfile = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    setProfile((prev) => ({
      ...prev,
      first_name: prev.first_name || '',
      middle_name: prev.middle_name || '',
      last_name: prev.last_name || '',
      suffix: prev.suffix || '',
      email: prev.email || '',
      gender: prev.gender || '',
      date_of_birth: prev.date_of_birth || '',
    }));
    setImagePreview(
      profile.profile_image
        ? imagePreview
        : profile.profile_pic
          ? `${BASE_IMAGE_URL}/${profile.profile_pic}`
          : '/imgs/profile.svg'
    );
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

      const response = await axios.post('http://127.0.0.1:8000/api/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setSuccessMessage(response.data.message || 'Profile updated successfully');
      setProfile({ ...profile, profile_image: null });
      setImagePreview(
        response.data.profile?.profile_pic
          ? `${BASE_IMAGE_URL}/${response.data.profile.profile_pic}?t=${Date.now()}`
          : '/imgs/profile.svg'
      );
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

  const handleEditPassword = (e) => {
    e.preventDefault();
    setIsEditingPassword(true);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancelEditPassword = (e) => {
    e.preventDefault();
    setIsEditingPassword(false);
    setPassword({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setErrors({});
    setSuccessMessage('');
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

      const response = await axios.post('http://127.0.0.1:8000/api/change-password', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setSuccessMessage(response.data.message || 'Password changed successfully');
      setPassword({ current_password: '', new_password: '', confirm_password: '' });
      setIsEditingPassword(false); // Toggle back to view mode on success
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
      'July', 'August', 'September', 'October', 'November', 'December',
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
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="calendar__days">
          {renderDays()}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-details">
      {isLoading && <div className="profile-details-loading">Loading profile...</div>}
      {successMessage && <div className="profile-details-success">{successMessage}</div>}
      {errors.general && <div className="profile-details-error">{errors.general}</div>}
      <div className="profile-details-section">
        <h2 className="profile-details-section-title">Profile Information</h2>
        <div className="profile-details-header">
          <div className="profile-details-profile-photo">
            <div className="profile-details-photo-placeholder">
              <img src={imagePreview} alt="Profile" className="profile-details-photo-preview" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="profile-photo-upload"
                disabled={isLoading || isSavingProfile || !isEditing}
              />
              <label htmlFor="profile-photo-upload" className="profile-details-photo-label">
                <div className="profile-details-upload-overlay">
                  <Upload size={18} className="profile-details-upload-icon" />
                </div>
              </label>
            </div>
          </div>
        </div>
        <form className="profile-details-form" onSubmit={handleUpdateProfile}>
          <div className="profile-details-form-row">
            <div className="profile-details-form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleProfileChange}
                disabled={isLoading || isSavingProfile || !isEditing}
                className="profile-details-input"
              />
              {errors.first_name && <span className="profile-details-error">{errors.first_name[0]}</span>}
            </div>
            <div className="profile-details-form-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={profile.middle_name}
                onChange={handleProfileChange}
                disabled={isLoading || isSavingProfile || !isEditing}
                className="profile-details-input"
              />
              {errors.middle_name && <span className="profile-details-error">{errors.middle_name[0]}</span>}
            </div>
          </div>
          <div className="profile-details-form-row">
            <div className="profile-details-form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleProfileChange}
                disabled={isLoading || isSavingProfile || !isEditing}
                className="profile-details-input"
              />
              {errors.last_name && <span className="profile-details-error">{errors.last_name[0]}</span>}
            </div>
            <div className="profile-details-form-group">
              <label>Suffix</label>
              <input
                type="text"
                name="suffix"
                value={profile.suffix}
                onChange={handleProfileChange}
                disabled={isLoading || isSavingProfile || !isEditing}
                className="profile-details-input"
              />
              {errors.suffix && <span className="profile-details-error">{errors.suffix[0]}</span>}
            </div>
          </div>
          <div className="profile-details-form-row">
            <div className="profile-details-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={isLoading || isSavingProfile || !isEditing}
                className="profile-details-input"
              />
              {errors.email && <span className="profile-details-error">{errors.email[0]}</span>}
            </div>
            <div className="profile-details-form-group profile-details-form-group-with-icon">
              <label>Gender</label>
              <div className="profile-details-input-wrapper">
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleProfileChange}
                  disabled={isLoading || isSavingProfile || !isEditing}
                  className="profile-details-dropdown"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown size={16} className="profile-details-input-icon" />
              </div>
              {errors.gender && <span className="profile-details-error">{errors.gender[0]}</span>}
            </div>
          </div>
          <div className="profile-details-form-row">
            <div className="profile-details-form-group profile-details-form-group-with-icon">
              <label>Date of Birth</label>
              <div className="profile-details-input-wrapper">
                <input
                  type="text"
                  name="date_of_birth"
                  value={profile.date_of_birth}
                  onChange={handleProfileChange}
                  disabled={isLoading || isSavingProfile || !isEditing}
                  className="profile-details-input"
                />
                <Calendar
                  size={16}
                  className="profile-details-input-icon"
                  onClick={isEditing ? toggleCalendar : null}
                />
                {showCalendar && isEditing && (
                  <div className="profile-details-calendar-popup">
                    <SimpleCalendar onSelect={handleDateSelect} />
                  </div>
                )}
              </div>
              {errors.date_of_birth && <span className="profile-details-error">{errors.date_of_birth[0]}</span>}
            </div>
          </div>

          {!isEditing && (
            <button
              className="profile-details-edit-button"
              onClick={handleEditProfile}
              disabled={isLoading}
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
          
          {isEditing && (
            <div className="profile-details-form-actions">
              <button
                type="submit"
                className="profile-details-save-button"
                disabled={isLoading || isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="profile-details-cancel-button"
                onClick={handleCancelEdit}
                disabled={isLoading || isSavingProfile}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
      <div className="profile-details-section">
        <h2 className="profile-details-section-title">Change Password</h2>
        <form onSubmit={handleChangePassword} className="profile-details-form">
          <div className="profile-details-form-group profile-details-form-group-with-icon">
            <label>Current Password</label>
            <div className="profile-details-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="current_password"
                value={password.current_password}
                onChange={handlePasswordChange}
                disabled={isLoading || isSavingPassword || !isEditingPassword}
                className="profile-details-input"
              />
              <div className="profile-details-password-toggle">
                {showCurrentPassword ? (
                  <EyeOff size={16} className="profile-details-input-icon" onClick={toggleCurrentPassword} />
                ) : (
                  <Eye size={16} className="profile-details-input-icon" onClick={toggleCurrentPassword} />
                )}
              </div>
            </div>
            {errors.current_password && <span className="profile-details-error">{errors.current_password[0]}</span>}
          </div>
          <div className="profile-details-form-group profile-details-form-group-with-icon">
            <label>New Password</label>
            <div className="profile-details-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="new_password"
                value={password.new_password}
                onChange={handlePasswordChange}
                disabled={isLoading || isSavingPassword || !isEditingPassword}
                className="profile-details-input"
              />
              <div className="profile-details-password-toggle">
                {showNewPassword ? (
                  <EyeOff size={16} className="profile-details-input-icon" onClick={toggleNewPassword} />
                ) : (
                  <Eye size={16} className="profile-details-input-icon" onClick={toggleNewPassword} />
                )}
              </div>
            </div>
            {errors.new_password && <span className="profile-details-error">{errors.new_password[0]}</span>}
          </div>
          <div className="profile-details-form-group profile-details-form-group-with-icon">
            <label>Confirm New Password</label>
            <div className="profile-details-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm_password"
                value={password.confirm_password}
                onChange={handlePasswordChange}
                disabled={isLoading || isSavingPassword || !isEditingPassword}
                className="profile-details-input"
              />
              <div className="profile-details-password-toggle">
                {showConfirmPassword ? (
                  <EyeOff size={16} className="profile-details-input-icon" onClick={toggleConfirmPassword} />
                ) : (
                  <Eye size={16} className="profile-details-input-icon" onClick={toggleConfirmPassword} />
                )}
              </div>
            </div>
            {errors.confirm_password && <span className="profile-details-error">{errors.confirm_password[0]}</span>}
          </div>
          {!isEditingPassword && (
            <button
              className="profile-details-edit-button"
              onClick={handleEditPassword}
              disabled={isLoading}
            >
              <Pencil size={16} />
              Edit Password
            </button>
          )}
          {isEditingPassword && (
            <div className="profile-details-form-actions">
              <button
                type="submit"
                className="profile-details-save-button"
                disabled={isLoading || isSavingPassword}
              >
                {isSavingPassword ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="profile-details-cancel-button"
                onClick={handleCancelEditPassword}
                disabled={isLoading || isSavingPassword}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileDetails;