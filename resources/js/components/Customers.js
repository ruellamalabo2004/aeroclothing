import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Customers() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    role: "customer",
    status: "Active",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/customers");
        setCustomers(response.data.data || []);
      } catch (error) {
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleEdit = (customer) => {
    setSelectedCustomer({ ...customer });
    setEditModalOpen(true);
  };

  const handleAddCustomer = () => {
    setAddModalOpen(true);
  };

  const handleArchive = async (customer) => {
    try {
      const newStatus = "Archived";
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${customer.id}/archive`,
        { status: newStatus }
      );
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, status: newStatus } : c
        )
      );
    } catch (err) {
      console.error("Error archiving customer:", err);
      alert("Failed to archive customer");
    }
  };

  const handleRevert = async (customer) => {
    try {
      setLoading(true);
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${customer.id}/restore`
      );
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, status: "Active" } : c
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error restoring customer:", err);
      setError("Failed to restore customer. Please try again.");
      alert("Failed to restore customer");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesTab =
      activeTab === "All" ||
      customer.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch =
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const updatedCustomerData = {
      full_name: selectedCustomer.full_name,
      email: selectedCustomer.email,
      phone_number: selectedCustomer.phone_number,
      gender: selectedCustomer.gender,
      date_of_birth: selectedCustomer.date_of_birth || null,
      role: selectedCustomer.role,
      status: selectedCustomer.status,
    };

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/users/${selectedCustomer.id}`,
        updatedCustomerData
      );
      const updatedCustomer = response.data.data || response.data;
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === updatedCustomer.id ? { ...customer, ...updatedCustomer } : customer
        )
      );
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error.response?.data || error.message);
      alert(`Failed to update customer: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddSubmit = async (event) => {
    event.preventDefault();
  
    const customerData = {
      first_name: newCustomer.first_name,
      middle_name: newCustomer.middle_name || null,
      last_name: newCustomer.last_name,
      suffix: newCustomer.suffix || null,
      email: newCustomer.email,
      phone_number: newCustomer.phone_number,
      gender: newCustomer.gender,
      date_of_birth: newCustomer.date_of_birth || null,
      role: newCustomer.role || "customer",
      status: newCustomer.status || "Active",
      password: "darwin",
    };
  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users",
        customerData
      );
  
      const createdCustomer = response.data.data || response.data;
      setCustomers((prev) => [...prev, createdCustomer]);
      setAddModalOpen(false);
      setNewCustomer({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        email: "",
        phone_number: "",
        gender: "",
        date_of_birth: "",
        role: "customer",
        status: "Active",
      });
    } catch (error) {
      console.error("Error adding customer:", error.response?.data || error.message);
      alert(`Failed to add customer: ${JSON.stringify(error.response?.data?.errors || error.response?.data?.message || error.message)}`);
    }
  };
  
  return (
    <main>
      <h1>Customers</h1>
      <div className="customers-links">
        <span className="customers-label">Customers:</span>
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
          placeholder="Search customers by name, email, or phone..."
          className="customers-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-customer-btn" onClick={handleAddCustomer}>
          Add Customer
        </button>
      </div>

      <div className="customers-table-container">
        {loading ? (
          <div>Loading customers...</div>
        ) : error ? (
          <div>{error}</div>
        ) : customers.length === 0 ? (
          <div>No customers found</div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Profile Pic</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <img
                      src="/imgs/editing.svg"
                      alt="Edit"
                      className="action-img"
                      onClick={() => handleEdit(customer)}
                    />
                    {customer.status === "Archived" ? (
                      <img
                        src="/imgs/revert.svg"
                        alt="Revert"
                        className="action-img"
                        onClick={() => handleRevert(customer)}
                      />
                    ) : (
                      <img
                        src="/imgs/archiving.svg"
                        alt="Archive"
                        className="action-img"
                        onClick={() => handleArchive(customer)}
                      />
                    )}
                  </td>
                  <td>
                    {customer.profile_pic ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${customer.profile_pic}`}
                        alt="Profile"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10%",
                        }}
                      />
                    ) : (
                      <img
                        src="/imgs/noprofile.svg"
                        alt="No Profile"
                        style={{ width: "40px", height: "40px", borderRadius: "10%" }}
                      />
                    )}
                  </td>
                  <td>{customer.full_name?.trim() || "N/A"}</td>
                  <td>{customer.email || "N/A"}</td>
                  <td>{customer.phone_number || "None"}</td>
                  <td>{customer.gender || "N/A"}</td>
                  <td>{formatDate(customer.date_of_birth)}</td>
                  <td>
                    <span
                      className={`status-frame status-${customer.status?.toLowerCase() || "unknown"}`}
                    >
                      {customer.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editModalOpen && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit Customer</h2>
            <form onSubmit={handleEditSubmit}>
              <div>
                <label>Full Name:</label>
                <input
                  type="text"
                  value={selectedCustomer?.full_name || ""}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={selectedCustomer?.email || ""}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Phone:</label>
                <input
                  type="text"
                  value={selectedCustomer?.phone_number || ""}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, phone_number: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Gender:</label>
                <select
                  value={selectedCustomer?.gender || ""}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={selectedCustomer?.date_of_birth?.split("T")[0] || ""}
                  onChange={(e) =>
                    setSelectedCustomer({ ...selectedCustomer, date_of_birth: e.target.value })
                  }
                />
              </div>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setEditModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Add New Customer</h2>
            <form onSubmit={handleAddSubmit}>
              <div>
                <label>First Name:</label>
                <input
                  type="text"
                  value={newCustomer.first_name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Middle Name:</label>
                <input
                  type="text"
                  value={newCustomer.middle_name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, middle_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Last Name:</label>
                <input
                  type="text"
                  value={newCustomer.last_name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Suffix:</label>
                <input
                  type="text"
                  value={newCustomer.suffix}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, suffix: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={newCustomer.phone_number}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone_number: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Gender:</label>
                <select
                  value={newCustomer.gender}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={newCustomer.date_of_birth}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, date_of_birth: e.target.value })
                  }
                />
              </div>
              <button type="submit">Add Customer</button>
              <button type="button" onClick={() => setAddModalOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}