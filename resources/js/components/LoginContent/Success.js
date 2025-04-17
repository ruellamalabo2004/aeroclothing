import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Success = ({ message = "Registration Successful!", isVisible, onClose }) => {
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
    <div className="success">
      <CheckCircle className="success__icon" size={20} />
      <p className="success__message">{message}</p>
    </div>
  );
};

export default Success;