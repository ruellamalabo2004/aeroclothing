import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const sizeOptions = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' }
];

const colorOptions = [
  { value: 'Red', label: 'Red' },
  { value: 'Blue', label: 'Blue' },
  { value: 'Green', label: 'Green' },
  { value: 'Black', label: 'Black' },
  { value: 'White', label: 'White' }
];

export default function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    product_type: "",
    sizes: [],
    price: "",
    description: "",
    status: "available",
    image_1: null,
    brand: "",
    colors: [],
  });
  const [editProductId, setEditProductId] = useState(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [productToArchive, setProductToArchive] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const uploadAreaRef = useRef(null);
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/products");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const productList = Array.isArray(data) ? data : data.data || [];
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories")
      .then((response) => {
        setCategories(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: response.data[0].id }));
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/brands")
      .then((response) => {
        setBrands(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, brand: response.data[0].id }));
        }
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
      });
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        setIsModalOpen(false);
        setIsArchiveModalOpen(false);
        setIsViewModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isLoading]);

  const filteredProducts = products.filter((product) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Available" && product.status === "available") ||
      (activeTab === "Archived" && product.status === "archived");
    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "price" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSizeChange = (selectedOptions) => {
    const selectedSizes = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, sizes: selectedSizes }));
  };

  const handleBrandChange = (e) => {
    setFormData((prev) => ({ ...prev, brand: e.target.value }));
  };

  const handleColorsChange = (selectedOptions) => {
    const selectedColors = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({ ...prev, colors: selectedColors }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && isValidFile(file)) {
      setFormData((prev) => ({ ...prev, image_1: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file (PNG, JPG, JPEG, GIF) under 2MB.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setFormData((prev) => ({ ...prev, image_1: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please drop a valid image file (PNG, JPG, JPEG, GIF) under 2MB.");
    }
  };

  const isValidFile = (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    const maxSize = 2 * 1024 * 1024;
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const triggerFileInput = () => {
    if (uploadAreaRef.current) {
      uploadAreaRef.current.querySelector(".file-input").click();
    }
  };

  const openAddModal = () => {
    setFormData({
      product_name: "",
      category: categories[0]?.id || "",
      product_type: "",
      sizes: [],
      price: "",
      description: "",
      status: "available",
      image_1: null,
      brand: brands[0]?.id || "",
      colors: [],
    });
    setImagePreview(null);
    setIsEditing(false);
    setEditProductId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      product_name: product.product_name || "",
      category: product.category_id || categories[0]?.id || "",
      product_type: product.product_type || "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes
        : product.sizes
        ? JSON.parse(product.sizes)
        : [],
      price: product.price || "",
      description: product.description || "",
      status: product.status || "available",
      image_1: null,
      brand: product.brand_id || brands[0]?.id || "",
      colors: Array.isArray(product.colors)
        ? product.colors
        : product.colors
        ? JSON.parse(product.colors)
        : [],
    });
    setImagePreview(
      product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : null
    );
    setEditProductId(product.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const saveProduct = async () => {
    if (!formData.product_name) {
      alert("Product name is required.");
      return;
    }
    if (!formData.category) {
      alert("Please select a category.");
      return;
    }
    if (!formData.brand) {
      alert("Please select a brand.");
      return;
    }
    if (!formData.product_type) {
      alert("Please select a product type.");
      return;
    }
    if (formData.sizes.length === 0) {
      alert("Please select at least one size.");
      return;
    }
    if (formData.colors.length === 0) {
      alert("Please select at least one color.");
      return;
    }
    if (!formData.price || formData.price < 0) {
      alert("Price is required and must be non-negative.");
      return;
    }

    setIsLoading(true);
    const formDataObj = new FormData();
    formDataObj.append("category_id", formData.category);
    formDataObj.append("brand_id", formData.brand);
    formDataObj.append("product_name", formData.product_name);
    formDataObj.append("product_type", formData.product_type);
    formData.sizes.forEach((size) => formDataObj.append("sizes[]", size));
    formData.colors.forEach((color) => formDataObj.append("colors[]", color));
    formDataObj.append("price", formData.price);
    formDataObj.append("description", formData.description || "");
    formDataObj.append("status", formData.status);

    if (formData.image_1 instanceof File) {
      formDataObj.append("image_1", formData.image_1);
    }

    if (isEditing) {
      formDataObj.append("_method", "PUT");
    }

    try {
      const url = isEditing
        ? `http://127.0.0.1:8000/api/products/${editProductId}`
        : "http://127.0.0.1:8000/api/products";
      const response = await axios.post(url, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      if (isEditing) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editProductId ? { ...p, ...data } : p))
        );
      } else {
        setProducts((prev) => [...prev, data]);
      }

      setIsModalOpen(false);
      setEditProductId(null);
      setIsEditing(false);
      setImagePreview(null);
      alert("Product " + (isEditing ? "updated" : "added") + " successfully!");
    } catch (error) {
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message +
        ": " +
        Object.values(error.response?.data?.errors || {}).flat().join(", ");
      alert(
        `Failed to ${isEditing ? "update" : "add"} product: ${
          errorMessage || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const archiveProduct = async (productId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });

      if (!res.ok) throw new Error(`Failed to archive product: ${res.status}`);
      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p))
      );
      setIsArchiveModalOpen(false);
      setProductToArchive(null);
    } catch (error) {
      console.error("Error archiving product:", error);
      alert(`Failed to archive product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveClick = (product) => {
    setProductToArchive(product);
    setIsArchiveModalOpen(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <main>
      <h1 style={{ color: "#000000", marginBottom: "20px" }}>Products</h1>
      <div className="products-links">
        <div className="left-section">
          <span className="products-label">Products:</span>
          <div className="links-container">
            {["All", "Available", "Archived"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="right-section">
          <input
            type="text"
            placeholder="Search products..."
            className="products-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="add-product-btn"
            onClick={openAddModal}
            disabled={isLoading}
          >
            Add New Product
          </button>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Sizes</th>
              <th>Brand</th>
              <th>Colors</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10">Loading...</td>
              </tr>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src="/imgs/viewing.svg"
                      alt="View"
                      className="action-img"
                      onClick={() => openViewModal(product)}
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      src="/imgs/editing.svg"
                      alt="Edit"
                      className="action-img"
                      onClick={() => openEditModal(product)}
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      src="/imgs/archiving.svg"
                      alt="Archive"
                      className="action-img"
                      onClick={() => handleArchiveClick(product)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
                    {product.image_1 ? (
                      <img
                        src={`${BASE_IMAGE_URL}/${product.image_1}`}
                        alt={product.product_name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.png"
                        alt="No Image"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </td>
                  <td>{product.product_name}</td>
                  <td>
                    {categories.find((cat) => cat.id === product.category_id)
                      ?.name || "N/A"}
                  </td>
                  <td>{product.product_type}</td>
                  <td>
                    {Array.isArray(product.sizes)
                      ? product.sizes.join(", ")
                      : product.sizes || "N/A"}
                  </td>
                  <td>
                    {brands.find((brand) => brand.id === product.brand_id)
                      ?.name || "N/A"}
                  </td>
                  <td>
                    {Array.isArray(product.colors)
                      ? product.colors.join(", ")
                      : product.colors || "N/A"}
                  </td>
                  <td>₱{product.price}</td>
                  <td>
                    <span
                      className={`status-frame status-${product.status.toLowerCase()}`}
                    >
                      {product.status === "available" ? "Available" : "Archived"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No products available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-btn"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => !isLoading && setIsModalOpen(false)}
        >
          <div
            className="edit-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-content">
              <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
              <form onSubmit={(e) => { e.preventDefault(); saveProduct(); }}>
                <div className="form-image-upload">
                  <div
                    className="image-upload"
                    ref={uploadAreaRef}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="upload-area" onClick={triggerFileInput}>
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover" }}
                        />
                      ) : (
                        <>
                          <div className="upload-icon"></div>
                          <p>Drag and drop or</p>
                          <span>Browse</span>
                          <p className="note">
                            Supported formats: PNG, JPG, JPEG, GIF (Max 2MB)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        name="image_1"
                        accept="image/*"
                        className="file-input"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name:</label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Type:</label>
                    <select
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Jacket">Jacket</option>
                      <option value="Swimwear">Swimwear</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Brand:</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleBrandChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sizes:</label>
                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={sizeOptions}
                      value={sizeOptions.filter(option => formData.sizes.includes(option.value))}
                      onChange={handleSizeChange}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                  <div className="form-group">
                    <label>Colors:</label>
                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={colorOptions}
                      value={colorOptions.filter(option => formData.colors.includes(option.value))}
                      onChange={handleColorsChange}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="available">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isLoading}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : isEditing
                      ? "Save Changes"
                      : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isArchiveModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => !isLoading && setIsArchiveModalOpen(false)}
        >
          <div
            className="archive-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="archive-modal-content">
              <h3>Archive this product?</h3>
              <p>
                Are you sure you want to archive "
                {productToArchive?.product_name}"?
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsArchiveModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="archive-btn"
                  onClick={() => archiveProduct(productToArchive.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Archiving..." : "Yes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedProduct && (
        <div 
          className="modal-overlay" 
          onClick={() => !isLoading && setIsViewModalOpen(false)}
        >
          <div 
            className="view-modal-container" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="view-modal-content">
              <h2>Product Details</h2>
              <form>
                <div className="form-image-upload">
                  <div className="image-preview">
                    {selectedProduct.image_1 ? (
                      <img
                        src={`${BASE_IMAGE_URL}/${selectedProduct.image_1}`}
                        alt={selectedProduct.product_name}
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.png"
                        alt="No Image"
                      />
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name:</label>
                    <div className="readonly-input">
                      {selectedProduct.product_name}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <div className="readonly-input">
                      {categories.find((cat) => cat.id === selectedProduct.category_id)?.name || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Product Type:</label>
                    <div className="readonly-input">
                      {selectedProduct.product_type}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Brand:</label>
                    <div className="readonly-input">
                      {brands.find((brand) => brand.id === selectedProduct.brand_id)?.name || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sizes:</label>
                    <div className="readonly-select">
                      {(Array.isArray(selectedProduct.sizes) 
                        ? selectedProduct.sizes 
                        : selectedProduct.sizes 
                          ? JSON.parse(selectedProduct.sizes) 
                          : []
                      ).map((size, index) => (
                        <span key={index} className="tag">{size}</span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Colors:</label>
                    <div className="readonly-select">
                      {(Array.isArray(selectedProduct.colors)
                        ? selectedProduct.colors
                        : selectedProduct.colors
                          ? JSON.parse(selectedProduct.colors)
                          : []
                      ).map((color, index) => (
                        <span key={index} className="tag">{color}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status:</label>
                    <div className="readonly-input">
                      {selectedProduct.status === "available" ? "Available" : "Archived"}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <div className="readonly-input">
                      ₱{selectedProduct.price}
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description:</label>
                  <div className="readonly-textarea">
                    {selectedProduct.description || "No description available"}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    disabled={isLoading}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}