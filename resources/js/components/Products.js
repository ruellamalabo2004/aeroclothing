import React, { useState, useEffect } from "react";

export default function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    product_name: "",
    category: "Womens",
    product_type: "Tops",
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

  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/products");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const handleSizeChange = (e) => {
    const selectedSizes = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, sizes: selectedSizes }));
  };

  const handleBrandChange = (e) => {
    setFormData((prev) => ({ ...prev, brand: e.target.value }));
  };

  const handleColorsChange = (e) => {
    const selectedColors = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, colors: selectedColors }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image_1: file }));
    }
  };

  const openAddModal = () => {
    setFormData({
      product_name: "",
      category: "Womens",
      product_type: "Tops",
      sizes: [],
      price: "",
      description: "",
      status: "available",
      image_1: null,
      brand: "",
      colors: [],
    });
    setIsEditing(false);
    setEditProductId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      product_name: product.product_name || "",
      category: product.category || "Womens",
      product_type: product.product_type || "Tops",
      sizes: Array.isArray(product.sizes) ? product.sizes : product.sizes ? JSON.parse(product.sizes) : [],
      price: product.price || "",
      description: product.description || "",
      status: product.status || "available",
      image_1: null,
      brand: product.brand || "",
      colors: Array.isArray(product.colors) ? product.colors : product.colors ? JSON.parse(product.colors) : [],
    });
    setEditProductId(product.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const saveProduct = async () => {
    setIsLoading(true);
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "sizes" || key === "colors") {
        formDataObj.append(key, JSON.stringify(formData[key]));
      } else if (key === "image_1" && formData.image_1 instanceof File) {
        formDataObj.append("image_1", formData.image_1);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataObj.append(key, formData[key]);
      }
    });

    if (isEditing) {
      formDataObj.append('_method', 'PUT');
    }

    try {
      const url = isEditing
        ? `http://127.0.0.1:8000/api/products/${editProductId}`
        : "http://127.0.0.1:8000/api/products";
      const method = isEditing ? "POST" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataObj,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to ${isEditing ? "update" : "add"} product: ${errorText}`);
      }

      const data = await res.json();

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
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} product:`, error);
      alert(`Failed to ${isEditing ? "update" : "add"} product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const archiveProduct = async (productId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!res.ok) {
        throw new Error(`Failed to archive product: ${res.status}`);
      }

      const updatedProduct = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p))
      );
      setIsArchiveModalOpen(false);
      setProductToArchive(null);
    } catch (error) {
      console.error('Error archiving product:', error);
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
      <h1>Products</h1>
      <div className="transactions-links">
        <span className="transactions-label">Products:</span>
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
        <input
          type="text"
          placeholder="Search products..."
          className="transactions-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-product-btn" onClick={openAddModal} disabled={isLoading}>
          Add New Product
        </button>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
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
                    <img src="/imgs/view.svg" alt="View" className="action-img" />
                    <img
                      src="/imgs/edit.svg"
                      alt="Edit"
                      className="action-img"
                      onClick={() => openEditModal(product)}
                      style={{ cursor: "pointer" }}
                    />
                    <img
                      src="/imgs/archive.svg"
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
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        onError={(e) =>
                          (e.target.src = "/placeholder.png")
                        }
                      />
                    ) : (
                      <img
                        src="/placeholder.png"
                        alt="No Image"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    )}
                  </td>
                  <td>{product.product_name}</td>
                  <td>{product.category}</td>
                  <td>{product.product_type}</td>
                  <td>{Array.isArray(product.sizes) ? product.sizes.join(", ") : product.sizes || "N/A"}</td>
                  <td>{product.brand || "N/A"}</td>
                  <td>{Array.isArray(product.colors) ? product.colors.join(", ") : product.colors || "N/A"}</td>
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
        <button onClick={handlePrevPage} disabled={currentPage === 1 || isLoading}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div
            className="edit-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-content">
              <h2>{isEditing ? "Edit Product" : "Add New Product"}</h2>
              <form>
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  disabled={isLoading}
                />

                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="Womens">Womens</option>
                  <option value="Mens">Mens</option>
                  <option value="Girls">Girls</option>
                  <option value="Boys">Boys</option>
                </select>

                <label>Product Type</label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Jacket">Jacket</option>
                  <option value="Swimwear">Swimwear</option>
                </select>

                <label>Sizes</label>
                <select
                  multiple
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleSizeChange}
                  disabled={isLoading}
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>

                <label>Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleBrandChange}
                  disabled={isLoading}
                >
                  <option value="">Select Brand</option>
                  <option value="1">Brand A</option>
                  <option value="2">Brand B</option>
                  <option value="3">Brand C</option>
                </select>

                <label>Colors</label>
                <select
                  multiple
                  name="colors"
                  value={formData.colors}
                  onChange={handleColorsChange}
                  disabled={isLoading}
                >
                  <option value="Red">Red</option>
                  <option value="Blue">Blue</option>
                  <option value="Green">Green</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                </select>

                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isLoading}
                />

                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                />

                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="available">Published</option>
                  <option value="archived">Archived</option>
                </select>

                <label>Product Image</label>
                <input
                  type="file"
                  name="image_1"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {isEditing && formData.image_1 === null && (
                  <p>Current image: {products.find((p) => p.id === editProductId)?.image_1}</p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="save-btn"
                    onClick={saveProduct}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Save Product"}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isArchiveModalOpen && (
        <div className="modal-overlay" onClick={() => !isLoading && setIsArchiveModalOpen(false)}>
          <div
            className="archive-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="archive-modal-content">
              <h3>Archive this product?</h3>
              <p>Are you sure you want to archive "{productToArchive?.product_name}"?</p>
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
    </main>
  );
}