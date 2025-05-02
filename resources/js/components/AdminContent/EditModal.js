import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import SuccessUpload from './SuccessUpload';

const EditModal = ({ isOpen, onClose, productId, token, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    brand_id: '',
    product_type_id: '',
    colors: [],
    price: '',
    status: 'available',
    sizes: [],
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
  const [sizeOptions, setSizeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [colorError, setColorError] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const fetchOptions = async () => {
    try {
      const [categoriesRes, brandsRes, sizesRes, colorsRes, productTypesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/brands', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/sizes', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/colors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:8000/api/product-types', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const activeCategories = categoriesRes.data.filter(category => !category.archived_at);
      const activeBrands = brandsRes.data.filter(brand => !brand.archived_at);
      const activeSizes = sizesRes.data.filter(size => !size.archived_at);
      const activeColors = colorsRes.data.filter(color => !color.archived_at);
      const activeProductTypes = productTypesRes.data.filter(type => !type.archived_at);

      setCategoryOptions(activeCategories);
      setBrandOptions(activeBrands);
      setSizeOptions(activeSizes);
      setColorOptions(activeColors);
      setProductTypeOptions(activeProductTypes);
    } catch (err) {
      console.error('Error fetching options:', err);
      setErrors({ fetch: ['Failed to load options'] });
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const product = res.data;
      setFormData({
        product_name: product.product_name || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        product_type_id: product.product_type_id || '',
        colors: product.colors ? product.colors.map(color => String(color.id)) : [],
        price: product.price || '',
        status: product.status || 'available',
        sizes: product.sizes ? product.sizes.map(size => String(size.id)) : [],
        description: product.description || '',
        image_1: null,
        image_2: null,
      });
      setImagePreviews({
        image_1: product.image_1 ? `http://localhost:8000/storage/${product.image_1}` : null,
        image_2: product.image_2 ? `http://localhost:8000/storage/${product.image_2}` : null,
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      setErrors({ fetch: ['Failed to load product'] });
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchOptions();
      fetchProduct();
    }
  }, [isOpen, productId, token]);

  useEffect(() => {
    if (!isOpen) {
      setImagePreviews({ image_1: null, image_2: null });
      setFormData({
        product_name: '',
        category_id: '',
        brand_id: '',
        product_type_id: '',
        colors: [],
        price: '',
        status: 'available',
        sizes: [],
        description: '',
        image_1: null,
        image_2: null,
      });
      setErrors({});
      setColorError(false);
      setSizeError(false);
      setIsSuccessVisible(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    const currentValues = formData[field];

    const updatedValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValues,
    }));

    if (field === 'colors') {
      setColorError(updatedValues.length === 0);
    }
    if (field === 'sizes') {
      setSizeError(updatedValues.length === 0);
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

  // Check if the form is valid
  const isFormValid = () => {
    return (
      formData.product_name &&
      formData.category_id &&
      formData.brand_id &&
      formData.product_type_id &&
      formData.colors.length > 0 &&
      formData.sizes.length > 0 &&
      formData.price > 0 &&
      formData.description &&
      !colorError &&
      !sizeError
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.product_name) newErrors.product_name = ['Product name is required'];
    if (!formData.category_id) newErrors.category_id = ['Category is required'];
    if (!formData.brand_id) newErrors.brand_id = ['Brand is required'];
    if (!formData.product_type_id) newErrors.product_type_id = ['Product type is required'];
    if (formData.colors.length === 0) newErrors.colors = ['At least one color is required'];
    if (!formData.price || formData.price <= 0) newErrors.price = ['Price must be a positive number'];
    if (!formData.description) newErrors.description = ['Description is required'];
    if (formData.sizes.length === 0) newErrors.sizes = ['At least one size is required'];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setColorError(formData.colors.length === 0);
      setSizeError(formData.sizes.length === 0);
      return;
    }

    const payload = new FormData();
    payload.append('product_name', formData.product_name);
    payload.append('category_id', parseInt(formData.category_id));
    payload.append('brand_id', parseInt(formData.brand_id));
    payload.append('product_type_id', parseInt(formData.product_type_id));
    
    // Updated to match the backend expected format for sizes and colors
    formData.sizes.forEach((sizeId) => payload.append('size_ids[]', sizeId));
    formData.colors.forEach((colorId) => payload.append('color_ids[]', colorId));
    
    payload.append('price', parseFloat(formData.price));
    payload.append('status', formData.status);
    payload.append('description', formData.description);
    if (formData.image_1) payload.append('image_1', formData.image_1);
    if (formData.image_2) payload.append('image_2', formData.image_2);
    payload.append('_method', 'PUT');

    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:8000/api/products/${productId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product updated:', response.data);
      showSuccess('Product Updated Successfully!');
      setTimeout(() => {
        onClose();
        if (onProductUpdated) onProductUpdated();
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error.response?.data || error.message);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
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
              <h2>Edit Product</h2>
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
                <select name="product_type_id" value={formData.product_type_id} onChange={handleInputChange} required>
                  <option value="">Select Type</option>
                  {productTypeOptions.map((type) => (
                    <option key={type.id} value={type.id}>{type.type_name}</option>
                  ))}
                </select>
                {errors.product_type_id && <p className="product-modal__error">{errors.product_type_id[0]}</p>}
              </div>

              {/* COLORS */}
              <div className="product-modal__field">
                <label>COLORS</label>
                <div className="product-modal__checkbox-group">
                  {colorOptions.map((color) => (
                    <label key={color.id} className="product-modal__checkbox-label">
                      <input
                        type="checkbox"
                        value={color.id}
                        checked={formData.colors.includes(String(color.id))}
                        onChange={(e) => handleCheckboxChange(e, 'colors')}
                      />
                      {color.color_name}
                    </label>
                  ))}
                </div>
                {colorError && <p className="product-modal__error">Please select at least one color.</p>}
                {errors.colors && <p className="product-modal__error">{errors.colors[0]}</p>}
                {errors.color_ids && <p className="product-modal__error">{errors.color_ids[0]}</p>}
              </div>

              {/* SIZES */}
              <div className="product-modal__field">
                <label>SIZES</label>
                <div className="product-modal__checkbox-group">
                  {sizeOptions.map((size) => (
                    <label key={size.id} className="product-modal__checkbox-label">
                      <input
                        type="checkbox"
                        value={size.id}
                        checked={formData.sizes.includes(String(size.id))}
                        onChange={(e) => handleCheckboxChange(e, 'sizes')}
                      />
                      {size.size_name}
                    </label>
                  ))}
                </div>
                {sizeError && <p className="product-modal__error">Please select at least one size.</p>}
                {errors.sizes && <p className="product-modal__error">{errors.sizes[0]}</p>}
                {errors.size_ids && <p className="product-modal__error">{errors.size_ids[0]}</p>}
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
                  min="0"
                  step="0.01"
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

              {/* DESCRIPTION */}
              <div className="product-modal__field">
                <label>DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
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
                  disabled={loading || !isFormValid()}
                >
                  {loading ? 'Updating Product...' : 'Update Product'}
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

export default EditModal;