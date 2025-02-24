import React, { useState } from "react";


export default function Orders() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    {
      id: 1,
      customer: "John Doe",
      paymentMethod: "Credit Card",
      total: "PHP 499.00",
      date: "2025-02-20",
      status: "Pending",
    },
    {
      id: 2,
      customer: "Jane Smith",
      paymentMethod: "PayPal",
      total: "PHP 799.00",
      date: "2025-02-21",
      status: "Processing",
    },
    {
      id: 3,
      customer: "Alice Johnson",
      paymentMethod: "Cash on Delivery",
      total: "PHP 599.00",
      date: "2025-02-22",
      status: "Shipped",
    },
    {
      id: 4,
      customer: "Bob Brown",
      paymentMethod: "Credit Card",
      total: "PHP 699.00",
      date: "2025-02-23",
      status: "Delivered",
    },
    {
      id: 5,
      customer: "Charlie Davis",
      paymentMethod: "PayPal",
      total: "PHP 399.00",
      date: "2025-02-24",
      status: "Canceled",
    },
    {
      id: 6,
      customer: "Emma Wilson",
      paymentMethod: "Cash on Delivery",
      total: "PHP 899.00",
      date: "2025-02-25",
      status: "Returned",
    },
  ];

  const orderCards = [
    { status: "Pending", count: orders.filter(o => o.status === "Pending").length },
    { status: "Processing", count: orders.filter(o => o.status === "Processing").length },
    { status: "Shipped", count: orders.filter(o => o.status === "Shipped").length },
    { status: "Delivered", count: orders.filter(o => o.status === "Delivered").length },
    { status: "Canceled", count: orders.filter(o => o.status === "Canceled").length },
    { status: "Returned", count: orders.filter(o => o.status === "Returned").length },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = order.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <main>
      <h1>Orders</h1>
      <div className="orders-cards-container">
        {orderCards.map((order) => (
          <div className="orders-card" key={order.status}>
            <img
              src={`/imgs/${order.status}.svg`}
              alt={order.status}
              className="orders-card-image"
            />
            <div className="orders-card-text">{order.status}</div>
            <div className="orders-card-number">{order.count}</div>
          </div>
        ))}
      </div>
      <div className="orders-links">
        <span className="orders-label">Orders:</span>
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
            className={activeTab === "Pending" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Pending");
            }}
          >
            Pending
          </a>
          <a
            href="#"
            className={activeTab === "Processing" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Processing");
            }}
          >
            Processing
          </a>
          <a
            href="#"
            className={activeTab === "Shipped" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Shipped");
            }}
          >
            Shipped
          </a>
          <a
            href="#"
            className={activeTab === "Delivered" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Delivered");
            }}
          >
            Delivered
          </a>
          <a
            href="#"
            className={activeTab === "Canceled" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Canceled");
            }}
          >
            Canceled
          </a>
          <a
            href="#"
            className={activeTab === "Returned" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Returned");
            }}
          >
            Returned
          </a>
        </div>
        <input
          type="text"
          className="orders-search"
          placeholder="Search by Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.paymentMethod}</td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>
                  <span className={`status-frame status-${order.status.toLowerCase()}`}>
                    {order.status}
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