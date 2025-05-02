import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import LoginSuccess from './LoginSuccess';
import Header from '../HeaderContent/Header';
import { useCart } from '../Notifs/CartContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const { handleLogin } = useCart(); // Get the handleLogin function from context

  useEffect(() => {
    // We should not clear token and user on component mount
    // This would log out already logged-in users viewing the login page
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Login successful:', response.data);
      
      // Check if user role is provided correctly
      const userRoleName = response.data.user.role;
      
      // Store the authentication data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUserRole(userRoleName);
      
      // Sync the cart with the server
      await handleLogin(response.data.token, response.data.user);
      
      setShowSuccess(true);
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response?.status === 400 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.status === 401) {
        setErrors({ general: err.response?.data?.message || 'Invalid email or password' });
      } else if (err.response?.status === 500) {
        // Handle server errors gracefully
        setErrors({ general: 'A server error occurred. Please try again later.' });
      } else {
        setErrors({ general: err.response?.data?.message || 'An error occurred during login' });
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Get fresh user data from localStorage to ensure we have the latest
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const role = user?.role;
      
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/homepage', { state: { user } });
      }
    } catch (err) {
      console.error('Navigation error:', err);
      // Fallback navigation
      navigate('/homepage');
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login">
        <h1 className="login__title">Welcome Back!</h1>
        <p className="login__subtitle">Enter your credentials for login</p>
        {errors.general && <p className="login__error">{errors.general}</p>}
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label htmlFor="email" className="login__label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="login__input"
              required
            />
            {errors.email && <p className="login__error">{errors.email[0]}</p>}
          </div>
          <div className="login__field">
            <label htmlFor="password" className="login__label">Password</label>
            <div className="login__password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="login__input"
                required
              />
              <button
                type="button"
                className="login__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="login__error">{errors.password[0]}</p>}
          </div>
          <div className="login__options">
            <label className="login__remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="login__forgot-password">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="login__submit-button">
            Sign In
          </button>
        </form>
        <div className="login__register">
          <span>Don't have an account?</span>
          <Link to="/register" className="login__register-link">Create Account</Link>
        </div>
        <LoginSuccess
          message="Login Successful!"
          isVisible={showSuccess}
          onClose={handleSuccessClose}
        />
      </div>
    </div>
  );
};

export default Login;