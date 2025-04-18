import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import SuccessUpload from './SuccessUpload';


const ProductModal = ({ isOpen, onClose, token, onProductAdded }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    brand_id: '',
    product_type: '',
    colors: '',
    price: '',
    status: 'available',
    sizes: '',
    description: '',
    image_1: null,
    image_2: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    image_1: null,
    image_2: null,
  });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [colorError, setColorError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  // Predefined color options (similar to sizes)
  const colorOptions = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

  const fetchOptions = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/categories'),
        axios.get('http://localhost:8000/api/brands'),
      ]);
  
      // Filter out archived categories and brands
      const activeCategories = categoriesRes.data.filter(category => !category.archived_at);
      const activeBrands = brandsRes.data.filter(brand => !brand.archived_at);
  
      setCategoryOptions(activeCategories); // Set only active categories
      setBrandOptions(activeBrands); // Set only active brands
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };
  

  useEffect(() => {
    if (isOpen) fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setImagePreviews({ image_1: null, image_2: null });
      setFormData({
        product_name: '',
        category_id: '',
        brand_id: '',
        product_type: '',
        colors: '',
        price: '',
        status: 'available',
        sizes: '',
        description: '',
        image_1: null,
        image_2: null,
      });
      setErrors({});
      setColorError(false);
      setIsSuccessVisible(false); // Reset success pop-up visibility
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    const currentValues = formData[field].split(',').filter(Boolean);

    const updatedValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValues.join(','),
    }));

    if (field === 'colors') {
      setColorError(updatedValues.length === 0);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews((prev) => ({ ...prev, [field]: previewUrl }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setIsSuccessVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!formData.product_name) newErrors.product_name = ['Product name is required'];
    if (!formData.category_id) newErrors.category_id = ['Category is required'];
    if (!formData.brand_id) newErrors.brand_id = ['Brand is required'];
    if (!formData.product_type) newErrors.product_type = ['Product type is required'];
    if (!formData.colors) newErrors.colors = ['At least one color is required'];
    if (!formData.price || formData.price <= 0) newErrors.price = ['Price must be a positive number'];
    if (!formData.description) newErrors.description = ['Description is required'];
    if (!formData.sizes) newErrors.sizes = ['At least one size is required'];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setColorError(!formData.colors);
      console.log('Validation errors:', newErrors);
      return;
    }

    const payload = new FormData();
    payload.append('product_name', formData.product_name);
    payload.append('category_id', parseInt(formData.category_id));
    payload.append('brand_id', parseInt(formData.brand_id));
    payload.append('product_type', formData.product_type);
    payload.append('colors', formData.colors);
    payload.append('sizes', formData.sizes);
    payload.append('price', parseFloat(formData.price));
    payload.append('status', formData.status);
    payload.append('description', formData.description);
    if (formData.image_1) payload.append('image_1', formData.image_1);
    if (formData.image_2) payload.append('image_2', formData.image_2);

    // Log FormData for debugging
    for (let [key, value] of payload.entries()) {
      console.log(key, value);
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/products', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product added:', response.data);
      showSuccess('Product Added Successfully!');
      setTimeout(() => {
        onClose();
        if (onProductAdded) onProductAdded(); // Trigger parent refresh
      }, 1000); // Delay closing to ensure pop-up is visible
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
      console.log('Full error:', error.response);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        console.log('Validation errors from server:', error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !isSuccessVisible) return null;

  return (
    <>
      {isOpen && (
        <div className="product-modal__overlay">
          <div className="product-modal">
            <div className="product-modal__header">
              <h2>Add New Product</h2>
              <button className="product-modal__close-button" onClick={onClose}>×</button>
            </div>
            <form className="product-modal__form" onSubmit={handleSubmit}>
              {/* IMAGE UPLOADS */}
              <div className="product-modal__image-upload">
                {['image_1', 'image_2'].map((field) => (
                  <div className="product-modal__image-field" key={field}>
                    <label>{field === 'image_1' ? 'MAIN IMAGE' : 'HOVER IMAGE'}</label>
                    <div className="product-modal__upload-placeholder">
                      {imagePreviews[field] ? (
                        <img src={imagePreviews[field]} alt="Preview" className="product-modal__image-preview" />
                      ) : formData[field] ? (
                        <span>{formData[field].name}</span>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span>Upload image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field)}
                        className="product-modal__file-input"
                      />
                    </div>
                    {errors[field] && <p className="product-modal__error">{errors[field][0]}</p>}
                  </div>
                ))}
              </div>

              {/* PRODUCT NAME */}
              <div className="product-modal__field">
                <label>PRODUCT NAME</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                />
                {errors.product_name && <p className="product-modal__error">{errors.product_name[0]}</p>}
              </div>

              {/* CATEGORY + BRAND */}
              <div className="product-modal__field-row">
                <div className="product-modal__field">
                  <label>CATEGORY</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
  <option value="">Select Category</option>
  {categoryOptions.map((c) => (
    <option key={c.id} value={c.id}>{c.name}</option>
  ))}
</select>

                  {errors.category_id && <p className="product-modal__error">{errors.category_id[0]}</p>}
                </div>

                <div className="product-modal__field">
                  <label>BRAND</label>
                  <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} required>
  <option value="">Select Brand</option>
  {brandOptions.map((b) => (
    <option key={b.id} value={b.id}>{b.name}</option>
  ))}
</select>

                  {errors.brand_id && <p className="product-modal__error">{errors.brand_id[0]}</p>}
                </div>
              </div>

              {/* PRODUCT TYPE */}
              <div className="product-modal__field">
                <label>PRODUCT TYPE</label>
                <select name="product_type" value={formData.product_type} onChange={handleInputChange} required>
                  <option value="">Select Type</option>
                  {['TOPS', 'BOTTOMS', 'JACKET', 'SWIMWEAR'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.product_type && <p className="product-modal__error">{errors.product_type[0]}</p>}
              </div>

              {/* COLORS */}
              <div className="product-modal__field">
                <label>COLORS</label>
                <div className="product-modal__checkbox-group">
                  {colorOptions.map((color) => (
                    <label key={color} className="product-modal__checkbox-label">
                      <input
                        type="checkbox"
                        value={color}
                        checked={formData.colors.split(',').includes(color)}
                        onChange={(e) => handleCheckboxChange(e, 'colors')}
                      />
                      {color}
                    </label>
                  ))}
                </div>
                {colorError && <p className="product-modal__error">Please select at least one color.</p>}
                {errors.colors && <p className="product-modal__error">{errors.colors[0]}</p>}
              </div>

              {/* PRICE */}
              <div className="product-modal__field">
                <label>PRICE</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                {errors.price && <p className="product-modal__error">{errors.price[0]}</p>}
              </div>

              {/* STATUS */}
              <div className="product-modal__field">
                <label>STATUS</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="available">Available</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status && <p className="product-modal__error">{errors.status[0]}</p>}
              </div>

              {/* SIZES */}
              <div className="product-modal__field">
                <label>SIZES</label>
                <div className="product-modal__checkbox-group">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <label key={size} className="product-modal__checkbox-label">
                      <input
                        type="checkbox"
                        value={size}
                        checked={formData.sizes.split(',').includes(size)}
                        onChange={(e) => handleCheckboxChange(e, 'sizes')}
                      />
                      {size}
                    </label>
                  ))}
                </div>
                {errors.sizes && <p className="product-modal__error">{errors.sizes[0]}</p>}
              </div>

              {/* DESCRIPTION */}
              <div className="product-modal__field">
                <label>DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && <p className="product-modal__error">{errors.description[0]}</p>}
              </div>

              {/* BUTTONS */}
              <div className="product-modal__actions">
                <button
                  type="button"
                  className="product-modal__button product-modal__button--secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="product-modal__button product-modal__button--primary"
                  disabled={loading}
                >
                  {loading ? 'Adding Product...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SuccessUpload
        message={successMessage}
        isVisible={isSuccessVisible}
        onClose={() => setIsSuccessVisible(false)}
      />
    </>
  );
};

export default ProductModal;