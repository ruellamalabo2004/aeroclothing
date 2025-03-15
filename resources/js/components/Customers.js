import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Customers() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers from Laravel API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/customers");
        console.log("Customers API Response:", response.data);
        setCustomers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on status and search input
  const filteredCustomers = customers.filter((customer) => {
    const matchesTab =
      activeTab === "All" ||
      customer.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch =
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    return matchesTab && matchesSearch;
  });

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
          placeholder="Search customers..."
          className="customers-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                <th>Customer Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <img src="/imgs/view.svg" alt="View" className="action-img" />
                    <img src="/imgs/editing.svg" alt="Edit" className="action-img" />
                    <img
                      src="/imgs/archiving.svg"
                      alt="Archive"
                      className="action-img"
                      onClick={async () => {
                        try {
                          await axios.post(
                            `http://127.0.0.1:8000/api/users/${customer.id}/archive`
                          );
                          setCustomers((prev) =>
                            prev.map((c) =>
                              c.id === customer.id ? { ...c, status: "Archived" } : c
                            )
                          );
                        } catch (err) {
                          console.error("Error archiving:", err);
                        }
                      }}
                    />
                  </td>
                  <td>{customer.full_name?.trim() || "N/A"}</td>
                  <td>{customer.email || "N/A"}</td>
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
    </main>
  );
}
