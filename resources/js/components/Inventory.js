import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    product_id: "",
    stock_quantity: 0,
    status: "Available",
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/inventory");
        setInventory(response.data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setError(error.response?.data?.message || "Failed to load inventory.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Handle input change for new inventory item
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "stock_quantity" ? parseInt(value) || 0 : value,
    }));
  };

  // Add new inventory item
  const handleAddProduct = () => {
    console.log("Sending data to API:", newItem); // Log what you're sending

    axios
      .post("http://127.0.0.1:8000/api/inventory", newItem)
      .then((response) => {
        console.log("Success:", response.data); // Log the response from Laravel
        setInventory([...inventory, response.data.data]);
        setShowAddForm(false);
        setNewItem({
          product_id: "",
          stock_quantity: "",
          status: "Available",
        });
      })
      .catch((error) => {
        console.error("Error response:", error.response?.data || error);
        alert(error.response?.data?.message || "Failed to add stock.");
      });
  };

  // Handle Edit Click
  const handleEditClick = (item) => {
    setSelectedItem({
      id: item.id,
      product_id: item.product_id,
      stock_quantity: parseInt(item.stock_quantity) || 0,
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
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: name === "stock_quantity" ? parseInt(value) || 0 : value,
    }));
  };

  // Handle Save Edit
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/inventory/${selectedItem.id}`,
        {
          product_id: selectedItem.product_id,
          stock_quantity: parseInt(selectedItem.stock_quantity) || 0,
          status: selectedItem.status,
        }
      );

      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.id === selectedItem.id ? { ...item, ...response.data.data } : item
        )
      );
      setSelectedItem(null);
    } catch (error) {
      console.error("Error updating item:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update inventory item.");
    }
  };

  // Handle Archive
  const handleArchive = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/inventory/${id}`);
      setInventory((prevInventory) => prevInventory.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error archiving item:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to archive inventory item.");
    }
  };

  // Filtered inventory based on search query and active filter
  const filteredInventory = inventory.filter((item) => {
    const productName = item.product?.product_name || "";
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;
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
            min="0"
          />
          <input
            type="number"
            name="stock_quantity"
            value={newItem.stock_quantity}
            onChange={handleNewItemChange}
            placeholder="Stock Quantity"
            min="0"
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
          <p><strong>Category:</strong> {viewItem.product?.category?.name || "N/A"}</p>
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
            min="0"
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
                      <td>{item.product?.product_name || "N/A"}</td>
                      <td>{item.product?.category?.name || "N/A"}</td>
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
                    <td colSpan="8" style={{ textAlign: "center" }}>
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