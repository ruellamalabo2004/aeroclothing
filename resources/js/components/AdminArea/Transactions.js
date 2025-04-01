import React, { useState } from "react";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const transactions = [
    {
      id: "TXN001",
      customer: "John Doe",
      amount: "PHP 499.00",
      date: "2025-02-20 10:30",
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      transactionStatus: "Completed",
    },
    {
      id: "TXN002",
      customer: "Jane Smith",
      amount: "PHP 799.00",
      date: "2025-02-21 15:45",
      paymentMethod: "PayPal",
      paymentStatus: "Unpaid",
      transactionStatus: "Pending",
    },
    {
      id: "TXN003",
      customer: "Alice Johnson",
      amount: "PHP 599.00",
      date: "2025-02-22 09:15",
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Paid",
      transactionStatus: "Completed",
    },
    {
      id: "TXN004",
      customer: "Bob Brown",
      amount: "PHP 699.00",
      date: "2025-02-23 13:00",
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      transactionStatus: "Completed",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab =
      activeTab === "All" || transaction.transactionStatus === (activeTab === "Completed" ? "Completed" : "Pending");
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main>
      <h1>Transactions</h1>
      <div className="transactions-links">
        <span className="transactions-label">Transactions:</span>
        <div className="links-container">
          <button
            className={activeTab === "All" ? "active" : ""}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={activeTab === "Completed" ? "active" : ""}
            onClick={() => setActiveTab("Completed")}
          >
            Completed
          </button>
          <button
            className={activeTab === "Pending" ? "active" : ""}
            onClick={() => setActiveTab("Pending")}
          >
            Pending
          </button>
        </div>
        <input
          type="text"
          placeholder="Search transactions..."
          className="transactions-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Customer Name</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Transaction Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{transaction.customer}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.date}</td>
                <td>{transaction.paymentMethod}</td>
                <td>
                  <span className={`status-frame status-${transaction.paymentStatus.toLowerCase()}`}>
                    {transaction.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-frame status-${transaction.transactionStatus.toLowerCase()}`}>
                    {transaction.transactionStatus}
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