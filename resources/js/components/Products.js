import React, { useState } from "react";

export default function Products() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: 1,
      name: "Men's Casual T-Shirt",
      price: "PHP 499.00",
      category: "Clothing",
      type: "Casual",
      quantity: 150,
      rating: 4.2,
      status: "Published",
    },
    {
      id: 2,
      name: "Women's Summer Dress",
      price: "PHP 799.00",
      category: "Clothing",
      type: "Dress",
      quantity: 80,
      rating: 4.5,
      status: "Archived",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" || product.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  return (
    <main>
      <h1>Products</h1>
      <div className="products-header">
        <div className="product-links">
          <span className="products-label">Products:</span>
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
              className={activeTab === "Published" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("Published");
              }}
            >
              Published
            </a>
            <a
              href="#"
              className={activeTab === "Archived" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("Archived");
              }}
            >
              Archived
            </a>
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
          <button className="add-product-btn">Add New Product</button>
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
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.category}</td>
                <td>{product.type}</td>
                <td>{product.quantity}</td>
                <td>{product.rating}</td>
                <td>
                  <span className={`status-frame status-${product.status.toLowerCase()}`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}