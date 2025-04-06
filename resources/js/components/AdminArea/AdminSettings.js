import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("category");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [notification, setNotification] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState("");

  // Fetch categories and brands on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/categories", {
        name: modalFormData,
      });
      showNotification("Category added successfully!");
      setModalFormData("");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      showNotification("Error adding category");
    }
  };

  // Handle adding a new brand
  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/brands", {
        name: modalFormData,
      });
      showNotification("Brand added successfully!");
      setModalFormData("");
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      showNotification("Error adding brand");
    }
  };

  // Handle archive action
  const handleArchive = (type, id) => {
    console.log(`Archiving ${type} with ID: ${id}`);
    // Add archive functionality here
  };

  const openModal = () => {
    setModalFormData("");
    setIsModalOpen(true);
  };

  return (
    <div className="admin-settings">
      {notification && (
        <div className="simple-notification">
          <span>{notification}</span>
        </div>
      )}

      <button type="button" className="submit-btn" onClick={openModal}>
        {activeTab === "category" ? "Add Category" : "Add Brand"}
      </button>
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === "category" ? "active" : ""}`}
          onClick={() => setActiveTab("category")}
        >
          CATEGORY
        </button>
        <button 
          className={`tab-button ${activeTab === "brand" ? "active" : ""}`}
          onClick={() => setActiveTab("brand")}
        >
          BRAND
        </button>
      </div>

      <div className="settings-container">
        {activeTab === "category" && (
          <div className="settings-section">
            <div className="header-area">
              <div className="table-header">
                <div className="header-cell">Action</div>
                <div className="header-cell">Category Name</div>
              </div>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="table-content">
                <div className="content-cell">
                  <img
                    src="/imgs/archiving.svg"
                    alt="Archive"
                    className="action-img"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleArchive('category', category.id)}
                  />
                </div>
                <div className="content-cell">
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "brand" && (
          <div className="settings-section">
            <div className="header-area">
              <div className="table-header">
                <div className="header-cell">Action</div>
                <div className="header-cell">Brand Name</div>
              </div>
            </div>
            {brands.map((brand) => (
              <div key={brand.id} className="table-content">
                <div className="content-cell">
                  <img
                    src="/imgs/archiving.svg"
                    alt="Archive"
                    className="action-img"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleArchive('brand', brand.id)}
                  />
                </div>
                <div className="content-cell">
                  {brand.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="edit-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-content">
              <h2>{activeTab === "category" ? "Add New Category" : "Add New Brand"}</h2>
              <form onSubmit={activeTab === "category" ? handleAddCategory : handleAddBrand} className="product-form">
                <div className="form-content">
                  <div className="form-group">
                    <label>{activeTab === "category" ? "Category Name" : "Brand Name"}</label>
                    <input
                      type="text"
                      value={modalFormData}
                      onChange={(e) => setModalFormData(e.target.value)}
                      placeholder={`Enter ${activeTab === "category" ? "category" : "brand"} name`}
                      required
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="publish-btn"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
