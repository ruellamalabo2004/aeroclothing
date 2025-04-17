import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';


const SuccessUpload = ({ message = "Upload Successful!", isVisible, onClose }) => {
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
    <div className="success-upload">
      <CheckCircle className="success-upload__icon" size={20} />
      <p className="success-upload__message">{message}</p>
    </div>
  );
};

export default SuccessUpload;