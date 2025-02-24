import React, { useState } from "react";


export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Customer",
      lastLogin: "2025-02-20 10:30",
      createdAt: "2025-01-01 09:00",
      updatedAt: "2025-02-15 14:00",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Admin",
      lastLogin: "2025-02-21 15:45",
      createdAt: "2025-01-02 12:00",
      updatedAt: "2025-02-20 16:00",
      status: "Active",
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      role: "Customer",
      lastLogin: "2025-02-19 09:15",
      createdAt: "2025-01-03 08:30",
      updatedAt: "2025-02-18 10:00",
      status: "Archived",
    },
    {
      id: 4,
      name: "Bob Brown",
      email: "bob.brown@example.com",
      role: "Admin",
      lastLogin: "2025-02-18 13:00",
      createdAt: "2025-01-04 11:00",
      updatedAt: "2025-02-17 15:00",
      status: "Active",
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesTab =
      activeTab === "All" || user.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main>
      <h1>Users</h1>
      <div className="users-links">
        <span className="users-label">Users:</span>
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
          placeholder="Search users..."
          className="users-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Last Login</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <img src="/imgs/view.svg" alt="View" className="action-img" />
                  <img src="/imgs/edit.svg" alt="Edit" className="action-img" />
                  <img src="/imgs/archive.svg" alt="Archive" className="action-img" />
                </td>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.lastLogin}</td>
                <td>{user.createdAt}</td>
                <td>{user.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}