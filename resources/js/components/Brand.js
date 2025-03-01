import React, { useState, useEffect } from "react";

export default function Brand() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [newBrand, setNewBrand] = useState({
    brand_name: "",
    email: "",
    contact_number: "",
    item_stock: 0,
    total_sales: 0,
    status: "Active",
  });

  // Fetch brands from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((error) => console.error("Error fetching brands:", error));
  }, []);

  const filteredBrands = brands.filter((brand) => {
    const matchesTab =
      activeTab === "All" || brand.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch = brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBrand((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBrand),
    })
      .then((res) => res.json())
      .then((data) => {
        setBrands((prev) => [...prev, data]); // Add new brand to list
        setIsModalOpen(false); // Close modal
        setNewBrand({ // Reset form
          brand_name: "",
          email: "",
          contact_number: "",
          item_stock: 0,
          total_sales: 0,
          status: "Active",
        });
      })
      .catch((error) => console.error("Error adding brand:", error));
  };

  return (
    <main>
      <h1>Brand</h1>
      <div className="brands-links">
        <span className="brands-label">Brands:</span>
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
            className={activeTab === "Archived" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Archived");
            }}
          >
            Archived
          </a>
        </div>
        <input
          type="text"
          placeholder="Search brands..."
          className="brands-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-brand-btn" onClick={() => setIsModalOpen(true)}>
          Add New Brand
        </button>
      </div>
      <div className="brands-table-container">
        <table className="brands-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Brand Name</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Item Stock</th>
              <th>Total Sales</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.map((brand) => (
              <tr key={brand.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{brand.brand_name}</td>
                <td>{brand.email}</td>
                <td>{brand.contact_number}</td>
                <td>{brand.item_stock}</td>
                <td>{brand.total_sales}</td>
                <td>{brand.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding a new brand */}
      {isModalOpen && (
        <div className="brands-modal-overlay">
          <div className="brands-modal">
            <h2>Add New Brand</h2>
            <form onSubmit={handleSubmit}>
              <div className="brands-form-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  name="brand_name"
                  value={newBrand.brand_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="brands-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newBrand.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="brands-form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contact_number"
                  value={newBrand.contact_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="brands-form-group">
                <label>Item Stock</label>
                <input
                  type="number"
                  name="item_stock"
                  value={newBrand.item_stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="brands-form-group">
                <label>Total Sales</label>
                <input
                  type="number"
                  name="total_sales"
                  value={newBrand.total_sales}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="brands-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newBrand.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="brands-modal-actions">
                <button type="submit" className="brands-save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="brands-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}