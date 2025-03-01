import React, { useState, useEffect } from "react";

export default function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isViewing, setIsViewing] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [newProduct, setNewProduct] = useState({
    category: "",
    name: "",
    type: "",
    subType: "",
    sizes: [],
    price: "",
    quantity: 0,
    description: "",
    status: "Published",
    images: [],
    paymentMethods: []
  });

  // Fetch products from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" || product.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const categoryOptions = [
    "Men's Clothing",
    "Women's Clothing",
    "Kid's Clothing Girl",
    "Boys Clothing (Kids)"
  ];

  const typeOptions = {
    "Men's Clothing": ["Tops", "Bottoms", "Jacket", "Swimwear"],
    "Women's Clothing": ["Tops", "Bottoms", "Jacket", "Swimwear"],
    "Kid's Clothing Girl": ["Tops", "Bottoms"],
    "Boys Clothing (Kids)": ["Tops", "Bottoms"]
  };

  const subTypeOptions = {
    Tops: ["Shirt", "T-shirt", "Hoodie"],
    Bottoms: ["Pants", "Shorts", "Skirt"],
    Jacket: ["Windbreaker", "Denim", "Leather"],
    Swimwear: ["One-piece", "Bikini", "Trunks"]
  };

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const paymentOptions = [
    "Visa/Mastercard",
    "GCash",
    "Grab",
    "Maya",
    "Cash on Delivery"
  ];

  const handleSizeToggle = (size) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handlePaymentToggle = (method) => {
    setNewProduct(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...newProduct.images];
      newImages[index] = file;
      setNewProduct(prev => ({ ...prev, images: newImages }));
    }
  };

  // Add New Product
  const addNewProduct = () => {
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((image, index) => {
          if (image) formData.append(`image${index}`, image);
        });
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    fetch("http://127.0.0.1:8000/api/products", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts((prev) => [...prev, data]);
        setIsAdding(false);
        setNewProduct({
          category: "",
          name: "",
          type: "",
          subType: "",
          sizes: [],
          price: "",
          quantity: 0,
          description: "",
          status: "Published",
          images: [],
          paymentMethods: []
        });
      })
      .catch((error) => console.error("Error adding product:", error));
  };

  // View Product
  const handleViewClick = (product) => {
    setIsViewing(product);
    setIsEditing(null);
    setIsAdding(false);
    setIsArchiving(null);
  };

  // Edit Product
  const handleEditClick = (product) => {
    setIsEditing({ ...product });
    setIsViewing(null);
    setIsAdding(false);
    setIsArchiving(null);
  };

  const handleEditChange = (e) => {
    setIsEditing({ ...isEditing, [e.target.name]: e.target.value });
  };

  const saveEditedProduct = () => {
    fetch(`http://127.0.0.1:8000/api/products/${isEditing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEditing),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts(
          products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
        setIsEditing(null);
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  // Archive Product with Confirmation
  const handleArchiveClick = (product) => {
    setIsArchiving(product);
  };

  const confirmArchive = () => {
    const updatedProduct = { ...isArchiving, status: "Archived" };
    fetch(`http://127.0.0.1:8000/api/products/${isArchiving.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    })
      .then((res) => res.json())
      .then((archivedProduct) => {
        setProducts(
          products.map((p) => (p.id === archivedProduct.id ? archivedProduct : p))
        );
        setIsArchiving(null);
      })
      .catch((error) => console.error("Error archiving product:", error));
  };

  return (
    <main>
      <h1>Products</h1>
      <div className="products-header">
        <div className="product-links">
          <span className="products-label">Products:</span>
          <div className="links-container">
            {["All", "Published", "Archived"].map((tab) => (
              <a
                key={tab}
                href="#"
                className={activeTab === tab ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
              >
                {tab}
              </a>
            ))}
          </div>
        </div>
        <div className="header-right">
          <input
            type="text"
            placeholder="Search products..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-product-btn" onClick={() => setIsAdding(true)}>
            Add New Product
          </button>
        </div>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Product</th>
              <th>Price</th>
              <th>Category</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Payment Methods</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src="/imgs/view.svg"
                    alt="View"
                    className="action-img"
                    onClick={() => handleViewClick(product)}
                  />
                  <img
                    src="/imgs/edit.svg"
                    alt="Edit"
                    className="action-img"
                    onClick={() => handleEditClick(product)}
                  />
                  <img
                    src="/imgs/archive.svg"
                    alt="Archive"
                    className="action-img"
                    onClick={() => handleArchiveClick(product)}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
                <td>{product.type}</td>
                <td>{product.quantity}</td>
                <td>{product.paymentMethods?.join(", ")}</td>
                <td>
                  <span
                    className={`status-frame status-${product.status.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Add New Product</h2>
              <div className="product-form-container">
                <div className="product-info">
                  <h3>Product Information</h3>
                  <form>
                    <div>
                      <label>Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value, type: "", subType: "" })}
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>

                    {newProduct.category && (
                      <div>
                        <label>Product Type</label>
                        <select
                          value={newProduct.type}
                          onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value, subType: "" })}
                        >
                          <option value="">Select Type</option>
                          {typeOptions[newProduct.category].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {newProduct.type && (
                      <div>
                        <label>Sub Product Type</label>
                        <select
                          value={newProduct.subType}
                          onChange={(e) => setNewProduct({ ...newProduct, subType: e.target.value })}
                        >
                          <option value="">Select Sub Type</option>
                          {subTypeOptions[newProduct.type].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label>Sizes</label>
                      <div className="size-selection-box">
                        {sizeOptions.map(size => (
                          <span
                            key={size}
                            className={`size-option ${newProduct.sizes.includes(size) ? "selected" : ""}`}
                            onClick={() => handleSizeToggle(size)}
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="price-quantity-row">
                      <div>
                        <label>Price</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label>Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label>Status</label>
                      <select
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                      >
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </form>
                </div>

                <div className="product-images-payments">
                  <div className="image-section">
                    <h3>Image Product</h3>
                    <div className="image-upload">
                      <div className="upload-area" onClick={() => document.querySelector('.image-inputs input').click()}>
                        <span className="cloud-icon">☁</span>
                        <p>Drop your image here or Click to Browse</p>
                        <p className="note">Note: Format photos SVG, PNG, or JPG</p>
                      </div>
                      <div className="image-inputs">
                        {[0, 1, 2, 3].map(index => (
                          <input
                            key={index}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                            className="file-input"
                            multiple={false} // Ensure only one file per input
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="payment-section">
                    <h3>Payment Methods</h3>
                    <div className="payment-selection-box">
                      {paymentOptions.map(method => (
                        <span
                          key={method}
                          className={`payment-option ${newProduct.paymentMethods.includes(method) ? "selected" : ""}`}
                          onClick={() => handlePaymentToggle(method)}
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
                <button type="button" className="publish-btn" onClick={() => {
                  setNewProduct({ ...newProduct, status: "Published" });
                  addNewProduct();
                }}>
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {isViewing && (
        <div className="modal-overlay" onClick={() => setIsViewing(null)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Product Details</h2>
              <p><strong>Name:</strong> {isViewing.name}</p>
              <p><strong>Price:</strong> {isViewing.price}</p>
              <p><strong>Category:</strong> {isViewing.category}</p>
              <p><strong>Type:</strong> {isViewing.type}</p>
              <p><strong>Sub Type:</strong> {isViewing.subType}</p>
              <p><strong>Sizes:</strong> {isViewing.sizes?.join(", ")}</p>
              <p><strong>Quantity:</strong> {isViewing.quantity}</p>
              <p><strong>Description:</strong> {isViewing.description}</p>
              <p><strong>Payment Methods:</strong> {isViewing.paymentMethods?.join(", ")}</p>
              <p><strong>Status:</strong> {isViewing.status}</p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsViewing(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(null)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Edit Product</h2>
              <form>
                {Object.keys(isEditing).map(
                  (key) =>
                    key !== "id" && key !== "images" && (
                      <div key={key}>
                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                        <input
                          type={key === "quantity" ? "number" : "text"}
                          name={key}
                          value={isEditing[key]}
                          onChange={handleEditChange}
                        />
                      </div>
                    )
                )}
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(null)}>
                    Cancel
                  </button>
                  <button type="button" className="save-btn" onClick={saveEditedProduct}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Popup */}
      {isArchiving && (
        <div className="modal-overlay" onClick={() => setIsArchiving(null)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>Archive this product?</h2>
              <p>Are you sure you want to archive "{isArchiving.name}"?</p>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsArchiving(null)}>
                  Cancel
                </button>
                <button type="button" className="save-btn" onClick={confirmArchive}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}