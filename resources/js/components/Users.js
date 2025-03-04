import React, { useState, useEffect } from "react";

export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${yourToken}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);
      
      const userData = Array.isArray(data) ? data : 
                      data.data ? data.data : 
                      data.users || [];
      
      console.log("Processed Users:", userData);
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Archive user (set status to Archived)
  const archiveUser = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/archive`, {
        method: "POST", // Using POST to avoid 405; adjust endpoint if needed
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${yourToken}`
        },
        body: JSON.stringify({ status: "Archived" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to archive user: ${response.status}`);
      }

      // Refresh the full user list after successful update
      await fetchUsers();
    } catch (error) {
      console.error("Error archiving user:", error);
      setError(error.message);
    }
  };

  // Enhanced role display function
  const getRoleDisplay = (user) => {
    if (user.role) return user.role;
    if (user.roles) return Array.isArray(user.roles) ? user.roles.join(", ") : user.roles;
    if (user.type) return user.type;
    if (user.is_admin !== undefined) return user.is_admin ? "Admin" : "Customer";
    return "N/A";
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const isActive = user.status === "Active";
    const isArchived = user.status === "Archived";
    const matchesTab =
      activeTab === "All" || (activeTab === "Archived" ? isArchived : isActive);
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

    return matchesTab && matchesSearch;
  });

  // Format timestamp
  const formatDate = (timestamp) => 
    timestamp ? new Date(timestamp).toLocaleString() : "N/A";

  return (
    <main>
      <h1>Users</h1>

      <div className="users-links">
        <span className="users-label">Users:</span>
        <div className="links-container">
          <button
            className={activeTab === "All" ? "active" : ""}
            onClick={() => setActiveTab("All")}
          >
            All
          </button>
          <button
            className={activeTab === "Archived" ? "active" : ""}
            onClick={() => setActiveTab("Archived")}
          >
            Archived
          </button>
        </div>
        <input
          type="text"
          placeholder="Search users by email..."
          className="users-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="users-table-container">
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>User ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id || Math.random()}>
                    <td>
                      <img src="/imgs/view.svg" alt="View" className="action-img" />
                      <img 
                        src="/imgs/edit.svg" 
                        alt="Edit" 
                        className="action-img" 
                        style={{ cursor: "pointer" }}
                        // Add onClick handler for edit if needed
                      />
                      <img 
                        src="/imgs/archive.svg" 
                        alt="Archive"
                        className="action-img"
                        onClick={() => archiveUser(user.id)}
                        style={{ cursor: "pointer" }}
                        disabled={user.status === "Archived"} // Disable if already archived
                      />
                    </td>
                    <td>{user.id || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{getRoleDisplay(user)}</td>
                    <td>{user.status || "N/A"}</td>
                    <td>{formatDate(user.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}