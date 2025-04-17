import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const LoginSuccess = ({ message = "Login Successful!", isVisible, onClose }) => {
  // Automatically close the pop-up after 3 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="login-success">
      <CheckCircle className="login-success__icon" size={20} />
      <p className="login-success__message">{message}</p>
    </div>
  );
};

export default LoginSuccess;