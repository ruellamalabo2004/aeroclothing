import React, { useState } from "react";


export default function Customers() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: 1,
      name: "John Doe",
      totalOrders: 5,
      totalSpent: "PHP 2495.00",
      orderDate: "2025-02-20",
      paymentMethod: "Credit Card",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      totalOrders: 3,
      totalSpent: "PHP 2397.00",
      orderDate: "2025-02-21",
      paymentMethod: "PayPal",
      status: "Archived",
    },
    {
      id: 3,
      name: "Alice Johnson",
      totalOrders: 2,
      totalSpent: "PHP 1198.00",
      orderDate: "2025-02-22",
      paymentMethod: "Cash on Delivery",
      status: "Active",
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const matchesTab =
      activeTab === "All" || customer.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase());
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
        <table className="customers-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Customer Name</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Order Date</th>
              <th>Payment Method</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{customer.name}</td>
                <td>{customer.totalOrders}</td>
                <td>{customer.totalSpent}</td>
                <td>{customer.orderDate}</td>
                <td>{customer.paymentMethod}</td>
                <td>
                  <span className={`status-frame status-${customer.status.toLowerCase()}`}>
                    {customer.status}
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