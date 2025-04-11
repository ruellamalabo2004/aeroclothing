import React, { useState, useEffect } from "react";
import axios from "axios";


const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsRes = await fetch("http://127.0.0.1:8000/api/products");
        if (!productsRes.ok) throw new Error(`HTTP error! Status: ${productsRes.status}`);
        const productsData = await productsRes.json();
        const productList = Array.isArray(productsData) ? productsData : productsData.data || [];

        const inventoryResponse = await axios.get("http://127.0.0.1:8000/api/inventory");

        setProducts(productList);
        setInventory(inventoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError(error.message || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const mergedProducts = products.map(product => {
    const inventoryItem = inventory.find(item => item.product_id === product.id);
    return {
      ...product,
      stock_quantity: inventoryItem?.stock_quantity || 0,
      status: inventoryItem?.status || "Out of Stock",
      inventory_id: inventoryItem?.id,
      image: product.image_1 ? `${BASE_IMAGE_URL}/${product.image_1}` : null
    };
  });

  const handleEditClick = (item) => {
    setSelectedItem({
      id: item.inventory_id,
      product_id: item.id,
      stock_quantity: item.stock_quantity || 0,
      status: item.status || "Out of Stock",
      product: item
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: name === "stock_quantity" ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!selectedItem.product_id || selectedItem.stock_quantity === undefined) {
      alert("Product ID and stock quantity are required");
      return;
    }

    try {
      const data = {
        product_id: selectedItem.product_id,
        stock_quantity: Number(selectedItem.stock_quantity),
        status: selectedItem.status || "Out of Stock",
      };

      let response;
      if (selectedItem.id) {
        response = await axios.put(
          `http://127.0.0.1:8000/api/inventory/${selectedItem.id}`,
          data,
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        response = await axios.post(
          "http://127.0.0.1:8000/api/inventory",
          data,
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      setInventory((prev) => {
        if (selectedItem.id) {
          return prev.map((item) =>
            item.id === selectedItem.id ? response.data.data : item
          );
        }
        return [...prev, response.data.data];
      });
      setSelectedItem(null);
      alert("Inventory updated successfully");
    } catch (error) {
      console.error("Error saving item:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.stock_quantity?.[0] || 
                          "Failed to save inventory item";
      alert(errorMessage);
    }
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) => {
      if (prev.some(selected => selected.id === item.id)) {
        return prev.filter(selected => selected.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleMultipleArchive = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to archive.");
      return;
    }

    try {
      const archivePromises = selectedItems
        .filter(item => item.inventory_id)
        .map(item => 
          axios.delete(`http://127.0.0.1:8000/api/inventory/${item.inventory_id}`)
        );
      
      await Promise.all(archivePromises);
      
      setInventory((prevInventory) => 
        prevInventory.filter(item => 
          !selectedItems.some(selected => selected.inventory_id === item.id)
        )
      );
      setSelectedItems([]);
      alert("Selected items archived successfully.");
    } catch (error) {
      console.error("Error archiving items:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to archive items.");
    }
  };

  const filteredProducts = mergedProducts.filter((item) => {
    const productName = item.product_name || "";
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedItems([]);
  };

  return (
    <main>
      <h1>Inventory Management</h1>

      <div className="inventory-card-container">
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/totalp.svg" alt="Total Products" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">{mergedProducts.length}</div>
              <div className="inventory-card-title">Total Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/availablep.svg" alt="Available Products" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">
                {mergedProducts.filter((item) => item.status === "Available").length}
              </div>
              <div className="inventory-card-title">Available Products</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/lowstock.svg" alt="Low Stock" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">
                {mergedProducts.filter((item) => item.status === "Low Stock").length}
              </div>
              <div className="inventory-card-title">Low Stock</div>
            </div>
          </div>
        </div>
        <div className="inventory-card-body">
          <div className="inventory-card-content">
            <img src="/imgs/outofstock.svg" alt="Out of Stock" className="inventory-card-image" />
            <div className="inventory-card-text">
              <div className="inventory-card-number">
                {mergedProducts.filter((item) => item.status === "Out of Stock").length}
              </div>
              <div className="inventory-card-title">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

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
                    setCurrentPage(1);
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button 
          className="archive-selected-btn"
          onClick={handleMultipleArchive}
          disabled={selectedItems.length === 0}
        >
          Archive Selected
        </button>
      </div>

      {selectedItem && (
        <div className="inventory-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="inventory-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inventory-modal-content">
              <h2>Edit Inventory Item</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="inventory-edit-form">
                <div className="inventory-form-group">
                  <label>Product:</label>
                  <input
                    type="text"
                    value={selectedItem.product?.product_name || "N/A"}
                    disabled
                  />
                </div>
                <div className="inventory-form-group">
                  <label>Stock Quantity:</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={selectedItem.stock_quantity || 0}
                    onChange={handleFormChange}
                    min="0"
                    required
                  />
                </div>
                <div className="inventory-form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={selectedItem.status || "Out of Stock"}
                    onChange={handleFormChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="inventory-form-buttons">
                  <button type="button" onClick={() => setSelectedItem(null)}>Cancel</button>
                  <button type="submit">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {!selectedItem && (
        <>
          {isLoading ? (
            <p>Loading inventory...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Image</th>
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
                  {currentProducts.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={selectedItems.some(selected => selected.id === item.id) 
                            ? "/imgs/checkbox2.svg" 
                            : "/imgs/checkmarkbox.svg"}
                          alt="Checkbox"
                          className="action-img"
                          onClick={() => handleCheckboxChange(item)}
                          style={{ cursor: "pointer", marginRight: "8px" }}
                        />
                        <img
                          src="/imgs/editing.svg"
                          alt="Edit"
                          className="action-img"
                          onClick={() => handleEditClick(item)}
                          style={{ cursor: "pointer", marginRight: "8px" }}
                        />
                        <img
                          src="/imgs/archiving.svg"
                          alt="Archive"
                          className="action-img"
                          onClick={() => handleMultipleArchive([item])}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td>
                        <img 
                          src={item.image || "/imgs/default-product.jpg"} 
                          alt={item.product_name} 
                          className="product-image"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                      </td>
                      <td>{item.product_name || "N/A"}</td>
                      <td>{item.category?.name || "N/A"}</td>
                      <td>{item.product_type || "N/A"}</td>
                      <td>{item.price || "N/A"}</td>
                      <td>{item.sizes?.join(", ") || "N/A"}</td>
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
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}