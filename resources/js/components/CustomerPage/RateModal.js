import React, { useState, useRef } from 'react';
import { Star, Upload, X } from 'lucide-react';

const RateModal = ({ isOpen, onClose, onSubmit, productName }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting rating:', { rating, feedback, images });
    
    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('review', feedback || `Rated ${rating} stars`);
    
    // Append each image to the FormData
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });
    
    onSubmit(formData);
    setRating(0);
    setFeedback('');
    setImages([]);
    setPreviewImages([]);
    onClose();
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Only allow up to 3 images
    const newFiles = files.slice(0, 3 - images.length);
    if (newFiles.length === 0) return;
    
    setImages([...images, ...newFiles]);
    
    // Create previews for the images
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewImages(newPreviews);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="rate-modal__overlay">
      <div className="rate-modal">
        <h2 className="rate-modal__title">Rate this product</h2>
        {productName && (
          <h3 className="rate-modal__product-name">{productName}</h3>
        )}
        <p className="rate-modal__subtitle">Your feedback helps us improve our products</p>
        <div className="rate-modal__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="rate-modal__star-btn"
              onClick={() => handleRating(star)}
            >
              <Star
                size={40}
                fill={star <= rating ? '#FFD700' : 'none'}
                stroke={star <= rating ? '#FFD700' : '#ccc'}
              />
            </button>
          ))}
        </div>
        <div className="rate-modal__rating-text">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="rate-modal__textarea"
            placeholder="Tell us about your experience with this product..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          
          {/* Image Upload Section */}
          <div className="rate-modal__image-upload">
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="rate-modal__image-previews">
                {previewImages.map((src, index) => (
                  <div key={index} className="rate-modal__image-preview">
                    <img src={src} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button" 
                      className="rate-modal__image-remove" 
                      onClick={() => removeImage(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Upload Button - only show if less than 3 images */}
            {images.length < 3 && (
              <button 
                type="button" 
                className="rate-modal__upload-btn" 
                onClick={triggerFileInput}
              >
                <Upload size={16} />
                Upload Images {images.length > 0 ? `(${3 - images.length} left)` : ''}
              </button>
            )}
          </div>
          
          <div className="rate-modal__buttons">
            <button type="button" className="rate-modal__cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="rate-modal__submit-btn"
              disabled={rating === 0}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateModal;