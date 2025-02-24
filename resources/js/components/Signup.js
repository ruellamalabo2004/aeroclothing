import React, { useState } from 'react';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signing up with:', { firstName, middleName, lastName, suffix, gender, dob, email, password });
  };

  return (
    <>
      {/* Header */}
      <header className="login-header">
        <div className="logo-container">
          <img src="/imgs/logo.svg" alt="Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <a href="#home">HOME</a>
          <a href="#shop">SHOP</a>
          <a href="#about">ABOUT US</a>
          <a href="#support" className="support-link">SUPPORT</a>
        </nav>
        <div className="header-icons">
          <img src="/imgs/Search.svg" alt="Search" className="header-icon" />
          <img src="/imgs/Wish.svg" alt="Wishlist" className="header-icon" />
          <img src="/imgs/Cart.svg" alt="Cart" className="header-icon" />
          <button className="login-button">Login</button>
        </div>
      </header>

      {/* Right-Side Image */}
      <div className="right-image-container">
        <img src="/imgs/design2.svg" alt="Right Image" className="right-image" />
      </div>

      {/* Left-Side Image */}
      <div className="left-image-container">
        <img src="/imgs/design1.svg" alt="Left Image" className="left-image" />
      </div>

      {/* Signup Container */}
      <div className="login-container">
        <h2>CREATE NEW ACCOUNT</h2>
        <p>Enter your details to sign up</p>

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
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
            <button type="submit" className="sign-in-button">Sign Up</button>

            {/* Separator Line */}
            <div className="separator"></div>

            {/* Already Have Account */}
            <p className="create-account-text">Already have an account?</p>
            <button 
              className="create-account-button" 
              onClick={() => window.location.href = '/login'}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
