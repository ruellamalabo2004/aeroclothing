import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';


const EditModal = ({ isOpen, onClose, productId, token, onProductUpdated }) => {
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

  // Predefined color options (same as ProductModal)
  const colorOptions = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

  // Fetch product data and options when modal opens
  const fetchData = async () => {
    try {
      const [productRes, categoriesRes, brandsRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/brands', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      const product = productRes.data;
      setFormData({
        product_name: product.product_name || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        product_type: product.product_type || '',
        colors: Array.isArray(product.colors) ? product.colors.join(',') : product.colors || '',
        price: product.price || '',
        status: product.status || 'available',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(',') : product.sizes || '',
        description: product.description || '',
        image_1: null, // File input starts empty
        image_2: null, // File input starts empty
      });
  
      setImagePreviews({
        image_1: product.image_1 ? `http://localhost:8000/storage/${product.image_1}` : null,
        image_2: product.image_2 ? `http://localhost:8000/storage/${product.image_2}` : null,
      });
  
      // Filter out archived categories and brands
      const activeCategories = categoriesRes.data.filter(category => !category.archived_at);
      const activeBrands = brandsRes.data.filter(brand => !brand.archived_at);
  
      setCategoryOptions(activeCategories); // Set only active categories
      setBrandOptions(activeBrands); // Set only active brands
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  

  useEffect(() => {
    if (isOpen && productId) {
      fetchData();
    }
  }, [isOpen, productId]);

  // Reset form when modal closes
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
    payload.append('_method', 'PUT'); // Laravel requires this for PUT requests in FormData

    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:8000/api/products/${productId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product updated:', response.data);
      onClose();
      if (onProductUpdated) onProductUpdated(); // Trigger table refresh
    } catch (error) {
      console.error('Error updating product:', error.response?.data || error.message);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal__overlay">
      <div className="edit-modal">
        <div className="edit-modal__header">
          <h2>Edit Product</h2>
          <button className="edit-modal__close-button" onClick={onClose}>×</button>
        </div>
        <form className="edit-modal__form" onSubmit={handleSubmit}>
          {/* IMAGE UPLOADS */}
          <div className="edit-modal__image-upload">
            {['image_1', 'image_2'].map((field) => (
              <div className="edit-modal__image-field" key={field}>
                <label>{field === 'image_1' ? 'MAIN IMAGE' : 'HOVER IMAGE'}</label>
                <div className="edit-modal__upload-placeholder">
                  {imagePreviews[field] ? (
                    <img src={imagePreviews[field]} alt="Preview" className="edit-modal__image-preview" />
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
                    className="edit-modal__file-input"
                  />
                </div>
                {errors[field] && <p className="edit-modal__error">{errors[field][0]}</p>}
              </div>
            ))}
          </div>

          {/* PRODUCT NAME */}
          <div className="edit-modal__field">
            <label>PRODUCT NAME</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              required
            />
            {errors.product_name && <p className="edit-modal__error">{errors.product_name[0]}</p>}
          </div>

          {/* CATEGORY + BRAND */}
          <div className="edit-modal__field-row">
            <div className="edit-modal__field">
              <label>CATEGORY</label>
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="edit-modal__error">{errors.category_id[0]}</p>}
            </div>

            <div className="edit-modal__field">
              <label>BRAND</label>
              <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} required>
                <option value="">Select Brand</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.brand_id && <p className="edit-modal__error">{errors.brand_id[0]}</p>}
            </div>
          </div>

          {/* PRODUCT TYPE */}
          <div className="edit-modal__field">
            <label>PRODUCT TYPE</label>
            <select name="product_type" value={formData.product_type} onChange={handleInputChange} required>
              <option value="">Select Type</option>
              {['TOPS', 'BOTTOMS', 'JACKET', 'SWIMWEAR'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.product_type && <p className="edit-modal__error">{errors.product_type[0]}</p>}
          </div>

          {/* COLORS */}
          <div className="edit-modal__field">
            <label>COLORS</label>
            <div className="edit-modal__checkbox-group">
              {colorOptions.map((color) => (
                <label key={color} className="edit-modal__checkbox-label">
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
            {colorError && <p className="edit-modal__error">Please select at least one color.</p>}
            {errors.colors && <p className="edit-modal__error">{errors.colors[0]}</p>}
          </div>

          {/* PRICE */}
          <div className="edit-modal__field">
            <label>PRICE</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            {errors.price && <p className="edit-modal__error">{errors.price[0]}</p>}
          </div>

          {/* STATUS */}
          <div className="edit-modal__field">
            <label>STATUS</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="available">Available</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && <p className="edit-modal__error">{errors.status[0]}</p>}
          </div>

          {/* SIZES */}
          <div className="edit-modal__field">
            <label>SIZES</label>
            <div className="edit-modal__checkbox-group">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <label key={size} className="edit-modal__checkbox-label">
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
            {errors.sizes && <p className="edit-modal__error">{errors.sizes[0]}</p>}
          </div>

          {/* DESCRIPTION */}
          <div className="edit-modal__field">
            <label>DESCRIPTION</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && <p className="edit-modal__error">{errors.description[0]}</p>}
          </div>

          {/* BUTTONS */}
          <div className="edit-modal__actions">
            <button
              type="button"
              className="edit-modal__button edit-modal__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-modal__button edit-modal__button--primary"
              disabled={loading}
            >
              {loading ? 'Updating Product...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;