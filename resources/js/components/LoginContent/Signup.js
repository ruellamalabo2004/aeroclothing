import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Success from './Success';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: 'None',
    gender: '',
    dateOfBirth: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        suffix: formData.suffix !== 'None' ? formData.suffix : null,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Registration successful:', response.data);
      setShowSuccess(true);
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.status === 400) {
        setErrors({ general: 'Bad request: Please check the data being sent' });
      } else {
        setErrors({ general: err.response?.data?.message || 'An error occurred during registration' });
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Add a small delay before redirecting for better UX
    setTimeout(() => navigate('/login'), 500);
  };

  return (
    <div className="signup">
      <h1 className="signup__title">Create an Account</h1>
      <p className="signup__subtitle">Please fill in your details</p>
      {errors.general && <p className="signup__error">{errors.general}</p>}
      <form className="signup__form" onSubmit={handleSubmit}>
        <div className="signup__row">
          <div className="signup__field">
            <label htmlFor="firstName" className="signup__label">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="signup__input"
              required
            />
            {errors.first_name && <p className="signup__error">{errors.first_name[0]}</p>}
          </div>
          <div className="signup__field">
            <label htmlFor="middleName" className="signup__label">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Enter your middle name"
              className="signup__input"
            />
            {errors.middle_name && <p className="signup__error">{errors.middle_name[0]}</p>}
          </div>
        </div>
        <div className="signup__row">
          <div className="signup__field">
            <label htmlFor="lastName" className="signup__label">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="signup__input"
              required
            />
            {errors.last_name && <p className="signup__error">{errors.last_name[0]}</p>}
          </div>
          <div className="signup__field">
            <label htmlFor="suffix" className="signup__label">Suffix</label>
            <div className="signup__select-wrapper">
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="signup__input"
              >
                <option value="None">Jr., Sr., III, etc.</option>
                <option value="Jr">Jr</option>
                <option value="Sr">Sr</option>
                <option value="II">II</option>
                <option value="III">III</option>
              </select>
              <ChevronDown className="signup__select-arrow" size={20} />
            </div>
            {errors.suffix && <p className="signup__error">{errors.suffix[0]}</p>}
          </div>
        </div>
        <div className="signup__row">
          <div className="signup__field">
            <label htmlFor="gender" className="signup__label">Gender</label>
            <div className="signup__select-wrapper">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="signup__input"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="signup__select-arrow" size={20} />
            </div>
            {errors.gender && <p className="signup__error">{errors.gender[0]}</p>}
          </div>
          <div className="signup__field">
            <label htmlFor="dateOfBirth" className="signup__label">Birthdate</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="signup__input"
              required
            />
            {errors.date_of_birth && <p className="signup__error">{errors.date_of_birth[0]}</p>}
          </div>
        </div>
        <div className="signup__field">
          <label htmlFor="email" className="signup__label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="signup__input"
            required
          />
          {errors.email && <p className="signup__error">{errors.email[0]}</p>}
        </div>
        <div className="signup__field">
          <label htmlFor="password" className="signup__label">Password</label>
          <div className="signup__password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="signup__input"
              required
            />
            <button
              type="button"
              className="signup__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="signup__error">{errors.password[0]}</p>}
        </div>
        <div className="signup__field">
          <label htmlFor="passwordConfirmation" className="signup__label">Confirm Password</label>
          <div className="signup__password-wrapper">
            <input
              type={showPasswordConfirmation ? 'text' : 'password'}
              id="passwordConfirmation"
              name="passwordConfirmation"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="signup__input"
              required
            />
            <button
              type="button"
              className="signup__toggle-password"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            >
              {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password_confirmation && <p className="signup__error">{errors.password_confirmation[0]}</p>}
        </div>
        <button type="submit" className="signup__submit-button">
          Create Account
        </button>
      </form>
      <div className="signup__login">
        <span>Already have an account?</span>
        <Link to="/login" className="signup__login-link">Sign in</Link>
      </div>
      <Success
        message="Registration Successful!"
        isVisible={showSuccess}
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default Signup;