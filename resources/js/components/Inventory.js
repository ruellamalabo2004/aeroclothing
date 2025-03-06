import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [newItem, setNewItem] = useState({
    product_id: "",
    stock_quantity: "",
    status: "Available",
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/inventory");
        console.log("Fetched inventory:", response.data); // Debug response
        setInventory(response.data);
      } catch (error) {
        console.error("Error fetching inventory:", error.response?.data || error.message);
        setError(error.response?.data?.message || "Failed to load inventory. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Handle input change for new inventory item
  const handleNewItemChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  // Add new inventory item
  const handleAddProduct = () => {
    axios
      .post("http://127.0.0.1:8000/api/inventory", newItem)
      .then((response) => {
        setInventory([...inventory, response.data.data]);
        setShowAddForm(false);
        setNewItem({
          product_id: "",
          stock_quantity: "",
          status: "Available",
        });
      })
      .catch((error) => console.error("Error adding inventory item:", error));
  };

  // Handle Edit Click
  const handleEditClick = (item) => {
    setSelectedItem({
      id: item.id,
      product_id: item.product_id,
      stock_quantity: item.stock_quantity,
      status: item.status,
      product: item.product,
    });
    setViewItem(null);
    setShowAddForm(false);
  };

  // Handle View Click
  const handleViewClick = (item) => {
    setViewItem(item);
    setSelectedItem(null);
    setShowAddForm(false);
  };

  // Handle Input Changes for Edit Form
  const handleFormChange = (e) => {
    setSelectedItem({ ...selectedItem, [e.target.name]: e.target.value });
  };

  // Handle Save Edit
  const handleSave = () => {
    axios
      .put(`http://127.0.0.1:8000/api/inventory/${selectedItem.id}`, {
        product_id: selectedItem.product_id,
        stock_quantity: selectedItem.stock_quantity,
        status: selectedItem.status,
      })
      .then(() => {
        setInventory(
          inventory.map((item) =>
            item.id === selectedItem.id ? { ...item, ...selectedItem } : item
          )
        );
        setSelectedItem(null);
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  // Handle Archive
  const handleArchive = (id) => {
    axios
      .delete(`http://127.0.0.1:8000/api/inventory/${id}`)
      .then(() => setInventory(inventory.filter((item) => item.id !== id)))
      .catch((error) => console.error("Error archiving item:", error));
  };

  // Filtered inventory based on search query and active filter
  const filteredInventory = inventory.filter((item) => {
    const productName = item.product?.product_name || ""; // Null-safe access
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Available" && item.status === "Available") ||
      (activeFilter === "Low Stock" && item.status === "Low Stock") ||
      (activeFilter === "Out of Stock" && item.status === "Out of Stock");
    return matchesSearch && matchesFilter;
  });

  return (
    <main>
      <h1>Inventory Management</h1>

      {/* Product Statistics Cards */}
      <div className="inventory-card-container">
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img
              src="/imgs/totalp.svg"
              alt="Total Products"
              className="inventory-card-image"
            />
            <div className="inventory-card-text">
              <div className="inventory-card-number">{inventory.length}</div>
              <div className="inventory-card-title">Total Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img
              src="/imgs/availablep.svg"
              alt="Available Products"
              className="inventory-card-image"
            />
            <div className="inventory-card-text">
              <div className="inventory-card-number">
                {inventory.filter((item) => item.status === "Available").length}
              </div>
              <div className="inventory-card-title">Available Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img
              src="/imgs/outofstock.svg"
              alt="Out of Stock"
              className="inventory-card-image"
            />
            <div className="inventory-card-text">
              <div className="inventory-card-number">
                {inventory.filter((item) => item.status === "Out of Stock").length}
              </div>
              <div className="inventory-card-title">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Container, Search Bar, and Add Product Button */}
      <div className="inventory-actions">
        <div className="inventory-links-container">
          <div className="inventory-links">
            <span className="inventory-label">Inventory:</span>
            <div className="links-container">
              {["All", "Available", "Low Stock", "Out of Stock"].map((tab) => (
                <a
                  href="#"
                  key={tab}
                  className={`inventory-link ${activeFilter === tab ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveFilter(tab);
                  }}
                >
                  {tab}
                </a>
              ))}
            </div>
          </div>
          <input
            type="text"
            className="inventory-search"
            placeholder="Search by Product Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="add-product-btn" onClick={() => setShowAddForm(true)}>
          Add Inventory Item
        </button>
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <div className="add-form">
          <h2>Add New Inventory Item</h2>
          <input
            type="number"
            name="product_id"
            value={newItem.product_id}
            onChange={handleNewItemChange}
            placeholder="Product ID"
          />
          <input
            type="number"
            name="stock_quantity"
            value={newItem.stock_quantity}
            onChange={handleNewItemChange}
            placeholder="Stock Quantity"
          />
          <select
            name="status"
            value={newItem.status}
            onChange={handleNewItemChange}
          >
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button onClick={handleAddProduct}>Save</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      {/* View Item Details */}
      {viewItem && (
        <div className="add-form">
          <h2>Item Details</h2>
          <p><strong>ID:</strong> {viewItem.id}</p>
          <p><strong>Product:</strong> {viewItem.product?.product_name || "N/A"}</p>
          <p><strong>Category:</strong> {viewItem.product?.category || "N/A"}</p>
          <p><strong>Type:</strong> {viewItem.product?.product_type || "N/A"}</p>
          <p><strong>Price:</strong> {viewItem.product?.price || "N/A"}</p>
          <p><strong>Sizes:</strong> {viewItem.product?.sizes?.join(", ") || "N/A"}</p>
          <p><strong>Stock Quantity:</strong> {viewItem.stock_quantity}</p>
          <p><strong>Status:</strong> {viewItem.status}</p>
          <button onClick={() => setViewItem(null)}>Close</button>
        </div>
      )}

      {/* Edit Item Form */}
      {selectedItem && (
        <div className="add-form">
          <h2>Edit Inventory Item</h2>
          <label>Product:</label>
          <input
            type="text"
            value={selectedItem.product?.product_name || "N/A"}
            disabled
          />
          <label>Stock Quantity:</label>
          <input
            type="number"
            name="stock_quantity"
            value={selectedItem.stock_quantity}
            onChange={handleFormChange}
          />
          <label>Status:</label>
          <select
            name="status"
            value={selectedItem.status}
            onChange={handleFormChange}
          >
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setSelectedItem(null)}>Cancel</button>
        </div>
      )}

      {/* Inventory Table */}
      {!selectedItem && !viewItem && !showAddForm && (
        <>
          {isLoading ? (
            <p>Loading inventory...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Sizes</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src="/imgs/view.svg"
                          alt="View"
                          className="action-img"
                          onClick={() => handleViewClick(item)}
                          style={{ cursor: "pointer", marginRight: "8px" }}
                        />
                        <img
                          src="/imgs/edit.svg"
                          alt="Edit"
                          className="action-img"
                          onClick={() => handleEditClick(item)}
                          style={{ cursor: "pointer", marginRight: "8px" }}
                        />
                        <img
                          src="/imgs/archive.svg"
                          alt="Archive"
                          className="action-img"
                          onClick={() => handleArchive(item.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>{item.id}</td>
                      <td>{item.product?.product_name || "N/A"}</td>
                      <td>{item.product?.category || "N/A"}</td>
                      <td>{item.product?.product_type || "N/A"}</td>
                      <td>{item.product?.price || "N/A"}</td>
                      <td>{item.product?.sizes?.join(", ") || "N/A"}</td>
                      <td>{item.stock_quantity}</td>
                      <td>
                        <span
                          className={`status-frame status-${item.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No inventory found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  );
}