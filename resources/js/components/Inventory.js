import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [newItem, setNewItem] = useState({
    product: "",
    category: "",
    type: "",
    price: "",
    sizes: "",
    stock_quantity: "",
    status: "Available",
  });

  // Fetch inventory data
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/inventory")
      .then((response) => setInventory(response.data))
      .catch((error) => console.error("Error fetching inventory:", error));
  }, []);

  // Handle input change for new product
  const handleNewItemChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  // Add new product
  const handleAddProduct = () => {
    axios
      .post("http://127.0.0.1:8000/api/inventory", newItem)
      .then((response) => {
        setInventory([...inventory, response.data.data]);
        setShowAddForm(false);
        setNewItem({
          product: "",
          category: "",
          type: "",
          price: "",
          sizes: "",
          stock_quantity: "",
          status: "Available",
        });
      })
      .catch((error) => console.error("Error adding new product:", error));
  };

  // Handle Edit Click
  const handleEditClick = (item) => {
    setSelectedItem(item);
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
      .put(`http://127.0.0.1:8000/api/inventory/${selectedItem.id}`, selectedItem)
      .then(() => {
        setInventory(
          inventory.map((item) =>
            item.id === selectedItem.id ? selectedItem : item
          )
        );
        setSelectedItem(null);
      })
      .catch((error) => console.error("Error updating item:", error));
  };

  // Handle Archive
  const handleArchive = (id) => {
    axios
      .delete(`http://127.0.0.1:8000/api/inventory/${id}/archive`)
      .then(() => setInventory(inventory.filter((item) => item.id !== id)))
      .catch((error) => console.error("Error archiving item:", error));
  };

  // Filtered inventory based on search query and active filter
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.product
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Available" && item.status === "Available") ||
      (activeFilter === "Low Stock" &&
        item.stock_quantity > 0 &&
        item.stock_quantity <= 10) ||
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
                {
                  inventory.filter((item) => item.status === "Out of Stock")
                    .length
                }
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
                  className={`inventory-link ${
                    activeFilter === tab ? "active" : ""
                  }`}
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
        <button
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="add-form">
          <h2>Add New Product</h2>
          <input
            type="text"
            name="product"
            value={newItem.product}
            onChange={handleNewItemChange}
            placeholder="Product Name"
          />
          <input
            type="text"
            name="category"
            value={newItem.category}
            onChange={handleNewItemChange}
            placeholder="Category"
          />
          <input
            type="text"
            name="type"
            value={newItem.type}
            onChange={handleNewItemChange}
            placeholder="Type"
          />
          <input
            type="number"
            name="price"
            value={newItem.price}
            onChange={handleNewItemChange}
            placeholder="Price"
          />
          <input
            type="text"
            name="sizes"
            value={newItem.sizes}
            onChange={handleNewItemChange}
            placeholder="Sizes"
          />
          <input
            type="number"
            name="stock_quantity"
            value={newItem.stock_quantity}
            onChange={handleNewItemChange}
            placeholder="Stock Quantity"
          />
          <button onClick={handleAddProduct}>Save</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      {/* View Item Details */}
      {viewItem && (
        <div className="add-form">
          <h2>Item Details</h2>
          <p><strong>ID:</strong> {viewItem.id}</p>
          <p><strong>Product:</strong> {viewItem.product}</p>
          <p><strong>Category:</strong> {viewItem.category}</p>
          <p><strong>Type:</strong> {viewItem.type}</p>
          <p><strong>Price:</strong> {viewItem.price}</p>
          <p><strong>Sizes:</strong> {viewItem.sizes}</p>
          <p><strong>Stock Quantity:</strong> {viewItem.stock_quantity}</p>
          <p><strong>Status:</strong> {viewItem.status}</p>
          <button onClick={() => setViewItem(null)}>Close</button>
        </div>
      )}

      {/* Edit Item Form */}
      {selectedItem && (
        <div className="add-form">
          <h2>Edit Item</h2>
          <label>Product:</label>
          <input
            type="text"
            name="product"
            value={selectedItem.product}
            onChange={handleFormChange}
          />
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={selectedItem.category}
            onChange={handleFormChange}
          />
          <label>Type:</label>
          <input
            type="text"
            name="type"
            value={selectedItem.type}
            onChange={handleFormChange}
          />
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={selectedItem.price}
            onChange={handleFormChange}
          />
          <label>Sizes:</label>
          <input
            type="text"
            name="sizes"
            value={selectedItem.sizes}
            onChange={handleFormChange}
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
                  <td>{item.product}</td>
                  <td>{item.category}</td>
                  <td>{item.type}</td>
                  <td>{item.price}</td>
                  <td>{item.sizes}</td>
                  <td>{item.stock_quantity}</td>
                  <td>
  <span
    className={`status-frame status-${item.status.toLowerCase().replace(/\s+/g, "-")}`}
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
    </main>
  );
}