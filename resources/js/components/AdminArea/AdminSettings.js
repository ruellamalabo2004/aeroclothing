import React, { useState } from "react";
import axios from "axios";


export default function AdminSettings() {
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "My Store",
    currency: "PHP", // Hardcoded to PHP
    maintenanceMode: false,
  });
  const [message, setMessage] = useState("");

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/categories", {
        name: categoryName,
      });
      setMessage(`Category "${response.data.name}" added successfully!`);
      setCategoryName("");
    } catch (error) {
      setMessage("Error adding category: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle adding a new brand
  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/brands", {
        name: brandName,
      });
      setMessage(`Brand "${response.data.name}" added successfully!`);
      setBrandName("");
    } catch (error) {
      setMessage("Error adding brand: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle general settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle saving general settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://127.0.0.1:8000/api/settings", generalSettings);
      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage("Error saving settings: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="admin-settings">
      <h1>Admin Settings</h1>

      {message && <div className="message">{message}</div>}

      <div className="settings-container">
        {/* Add Category Section */}
        <section className="settings-section">
          <h2>Add New Category</h2>
          <form onSubmit={handleAddCategory} className="settings-form">
            <div className="form-group">
              <label htmlFor="categoryName">Category Name:</label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            <button type="submit" className="submit-btn">Add Category</button>
          </form>
        </section>

        {/* Add Brand Section */}
        <section className="settings-section">
          <h2>Add New Brand</h2>
          <form onSubmit={handleAddBrand} className="settings-form">
            <div className="form-group">
              <label htmlFor="brandName">Brand Name:</label>
              <input
                type="text"
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
                required
              />
            </div>
            <button type="submit" className="submit-btn">Add Brand</button>
          </form>
        </section>

        {/* General Settings Section */}
        <section className="settings-section">
          <h2>General Settings</h2>
          <form onSubmit={handleSaveSettings} className="settings-form">
            <div className="form-group">
              <label htmlFor="siteName">Site Name:</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleSettingsChange}
                placeholder="Enter site name"
              />
            </div>
            <div className="form-group">
              <label>Currency:</label>
              <span className="currency-display">₱ (PHP)</span> {/* Display only PHP */}
              <input
                type="hidden"
                name="currency"
                value={generalSettings.currency}
              />
            </div>
            <div className="form-group checkbox-group">
              <label htmlFor="maintenanceMode">Maintenance Mode:</label>
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onChange={handleSettingsChange}
              />
            </div>
            <button type="submit" className="submit-btn">Save Settings</button>
          </form>
        </section>
      </div>
    </div>
  );
}
