import React, { useState, useEffect } from "react";

export default function Coupons() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    coupon_code: "",
    name: "",
    type: "Percentage",
    discount: 0,
    applies_to: "",
    duration: "",
    usage_limits: 0,
  });

  // Fetch coupons from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/coupons")
      .then((res) => res.json())
      .then((data) => setCoupons(data))
      .catch((error) => console.error("Error fetching coupons:", error));
  }, []);

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesTab =
      activeTab === "All" || coupon.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch = coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:8000/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCoupon),
    })
      .then((res) => res.json())
      .then((data) => {
        setCoupons((prev) => [...prev, data]);
        setIsModalOpen(false);
        setNewCoupon({
          coupon_code: "",
          name: "",
          type: "Percentage",
          discount: 0,
          applies_to: "",
          duration: "",
          usage_limits: 0,
        });
      })
      .catch((error) => console.error("Error adding coupon:", error));
  };

  return (
    <main>
      <h1>Coupons</h1>
      <div className="coupons-links">
        <span className="coupons-label">Coupons:</span>
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
          placeholder="Search coupons..."
          className="coupons-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-coupon-btn" onClick={() => setIsModalOpen(true)}>
          Add New Coupon
        </button>
      </div>
      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Coupon Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Applies To</th>
              <th>Duration</th>
              <th>Usage Limits</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{coupon.coupon_code}</td>
                <td>{coupon.name}</td>
                <td>{coupon.type}</td>
                <td>{coupon.discount}</td>
                <td>{coupon.applies_to}</td>
                <td>{coupon.duration}</td>
                <td>{coupon.usage_limits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding a new coupon */}
      {isModalOpen && (
        <div className="coupons-modal-overlay">
          <div className="coupons-modal">
            <h2>Add New Coupon</h2>
            <form onSubmit={handleSubmit}>
              <div className="coupons-form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  name="coupon_code"
                  value={newCoupon.coupon_code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="coupons-form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={newCoupon.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="coupons-form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={newCoupon.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
              <div className="coupons-form-group">
                <label>Discount</label>
                <input
                  type="number"
                  name="discount"
                  value={newCoupon.discount}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="coupons-form-group">
                <label>Applies To</label>
                <input
                  type="text"
                  name="applies_to"
                  value={newCoupon.applies_to}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="coupons-form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={newCoupon.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="coupons-form-group">
                <label>Usage Limits</label>
                <input
                  type="number"
                  name="usage_limits"
                  value={newCoupon.usage_limits}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              <div className="coupons-modal-actions">
                <button type="submit" className="coupons-save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="coupons-cancel-btn"
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