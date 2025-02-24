import React, { useState } from "react";    

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const inventory = [
    { id: 1, name: "Cotton T-Shirt", category: "Men's Clothing", type: "Casual", price: "PHP 599.00", sizes: "S, M, L, XL", stock: 50, status: "Available" },
    { id: 2, name: "Denim Jeans", category: "Men's Clothing", type: "Pants", price: "PHP 1,499.00", sizes: "30, 32, 34", stock: 8, status: "Low Stock" },
    { id: 3, name: "Floral Dress", category: "Women's Clothing", type: "Dress", price: "PHP 999.00", sizes: "S, M, L", stock: 75, status: "Available" },
    { id: 4, name: "Leather Jacket", category: "Men's Clothing", type: "Outerwear", price: "PHP 3,999.00", sizes: "M, L, XL", stock: 0, status: "Out of Stock" },
    { id: 5, name: "Sweatshirt", category: "Unisex Clothing", type: "Casual", price: "PHP 899.00", sizes: "S, M, L, XL", stock: 30, status: "Available" },
  ];

  const totalProducts = inventory.length;
  const availableProducts = inventory.filter(item => item.status === "Available").length;
  const outOfStockProducts = inventory.filter(item => item.status === "Out of Stock").length;

  const filteredInventory = inventory.filter((item) => {
    const matchesTab = activeTab === "All" || item.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      item.id.toString().includes(searchQuery) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main>
      <h1>Inventory</h1>
      <div className="inventory-card-container">
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/totalp.svg" alt="Total Products" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">{totalProducts}</div>
              <div className="inventory-card-title">Total Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/availablep.svg" alt="Available Products" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">{availableProducts}</div>
              <div className="inventory-card-title">Available Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/outofstock.svg" alt="Out of Stock" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">{outOfStockProducts}</div>
              <div className="inventory-card-title">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="inventory-links">
        <span className="inventory-label">Inventory:</span>
        <div className="links-container">
          <a
            href="#"
            className={activeTab === "All" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("All");
            }}
          >
            All
          </a>
          <a
            href="#"
            className={activeTab === "Available" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Available");
            }}
          >
            Available
          </a>
          <a
            href="#"
            className={activeTab === "Low Stock" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Low Stock");
            }}
          >
            Low Stock
          </a>
          <a
            href="#"
            className={activeTab === "Out of Stock" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Out of Stock");
            }}
          >
            Out of Stock
          </a>
        </div>
        <input
          type="text"
          className="inventory-search"
          placeholder="Search by Product ID or Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="inventory-table-container">
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
            {filteredInventory.map((item) => {
              const statusClass = `status-frame status-${item.status.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <tr key={item.id}>
                  <td>
                    <img src="/imgs/view.svg" alt="View" className="action-img" />
                    <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                    <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.type}</td>
                  <td>{item.price}</td>
                  <td>{item.sizes}</td>
                  <td>{item.stock}</td>
                  <td>
                    <span className={statusClass}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}