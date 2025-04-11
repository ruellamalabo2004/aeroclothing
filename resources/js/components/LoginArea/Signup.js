import React, { useState } from 'react';
import axios from 'axios';
import Footer from '../FooterNav/Footer';
import { Link } from 'react-router-dom';
import LoginHeader from '../HeaderNav/LoginHeader';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); // Single state for any popup
  const [isSuccess, setIsSuccess] = useState(false); // Track if it's a success or error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setShowPopup(false); // Reset popup state

    const age = new Date().getFullYear() - new Date(dob).getFullYear();

    const requestData = {
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix: suffix,
      gender: gender,
      date_of_birth: dob,
      age: age,
      email: email,
      password: password
    };

    console.log("Sending data to API:", requestData);

    try {
      const response = await axios.post('http://localhost:8000/api/register', requestData);

      setMessage('Registration successful!'); // Set the success message
      setIsSuccess(true); // Mark as success
      setShowPopup(true); // Show the popup

      console.log('User Registered:', response.data);

      localStorage.setItem('token', response.data.token);

      // Hide popup and redirect after 3 seconds
      setTimeout(() => {
        setShowPopup(false); // Hide the popup
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      setIsSuccess(false); // Mark as error
      if (error.response) {
        console.error('Error:', error.response.data);
        setMessage(error.response.data.message || 'Registration failed.');
      } else {
        setMessage('Something went wrong. Please try again.');
      }
      setShowPopup(true); // Show the error popup

      // Hide error popup after 3 seconds (you can adjust this timing)
      setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />

      {/* Success/Error Popup Notification */}
      {showPopup && (
        <div className={`notification-popup ${isSuccess ? 'success' : 'error'}`}>
          <div className="notification-content">
            <img 
              src={isSuccess ? '/imgs/Check.svg' : '/imgs/Error.svg'} 
              alt={isSuccess ? 'Success' : 'Error'} 
              className="notification-icon" 
            />
            <p>{message}</p>
          </div>
        </div>
      )}

      {/* Signup Container */}
      <div className="login-container">
        <h2>CREATE NEW ACCOUNT</h2>
        <p>Enter your details to sign up</p>

        {message && !showPopup && <p className="message">{message}</p>} {/* Show error messages below form if no popup is active */}

        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {/* First Name & Middle Name */}
            <div className="form-group-row">
              <input 
                type="text" 
                className="name-input" 
                placeholder="First Name" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                className="name-input" 
                placeholder="Middle Name" 
                value={middleName} 
                onChange={(e) => setMiddleName(e.target.value)} 
              />
            </div>

            {/* Last Name, Suffix & Gender */}
            <div className="form-group-row">
              <input 
                type="text" 
                className="name-input" 
                placeholder="Last Name" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                className="suffix-input" 
                placeholder="Suffix (e.g., Jr., Sr., III)" 
                value={suffix} 
                onChange={(e) => setSuffix(e.target.value)} 
              />
              <select 
                className="gender-input" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)} 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="form-group-full">
              <input 
                type="date" 
                className="dob-input" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
                required 
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <input 
                type="email" 
                className="email-input" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <input 
                type="password" 
                className="password-input" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {/* Signup Button */}
            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>

      {/* Already have an account section */}
      <div className="account-prompt">
        <p className="account-text">Already have an account?</p>
        <Link to="/login" className="account-button">
          Login
        </Link>
      </div>

      <Footer />
    </>
  );
};

export default Signup;