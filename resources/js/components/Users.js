import React, { useState, useEffect } from "react";

export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      const userData = Array.isArray(data)
        ? data
        : data.data || data.users || [];

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

  // Archive User
  const archiveUser = (userId) => {
    console.log("Initiating archive for user ID:", userId);
    setUserToArchive(userId);
    setShowArchiveDialog(true);
  };

  const confirmArchive = async () => {
    if (!userToArchive) {
      console.log("No user selected to archive");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending archive request for user:", userToArchive);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userToArchive}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Archive response error:", errorData);
        throw new Error(`Failed to archive user: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      console.log("Archive successful, response:", responseData);

      setUsers(users.map(user =>
        user.id === userToArchive ? { ...user, status: "Archived" } : user
      ));
      setShowArchiveDialog(false);
      setUserToArchive(null);
      setError(null);
    } catch (error) {
      console.error("Error archiving user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelArchive = () => {
    console.log("Archive cancelled");
    setShowArchiveDialog(false);
    setUserToArchive(null);
  };

  // Restore Archived User
  const restoreUser = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/restore`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to restore user: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const responseData = await response.json();
      console.log("Restore successful, response:", responseData);

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: "Active" } : user
      ));
      setError(null);
    } catch (error) {
      console.error("Error restoring user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (user) => {
    if (user.role) return user.role;
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0)
      return user.roles.join(", ");
    if (user.type) return user.type;
    if (user.is_admin !== undefined) return user.is_admin ? "Admin" : "Customer";
    return "N/A";
  };

  const filteredUsers = users.filter((user) => {
    const isActive = user.status === "Active";
    const isArchived = user.status === "Archived";
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Archived" ? isArchived : activeTab === "Active" ? isActive : false);
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

    return matchesTab && matchesSearch;
  });

  const formatDate = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleString() : "N/A";

  const getStatusStyle = (status) => ({
    padding: "2px 8px",
    borderRadius: "4px",
    border: `1px solid ${status === "Active" ? "green" : "red"}`,
    color: status === "Active" ? "green" : "red",
    display: "inline-block",
  });

  return (
    <main className="users-main">
      <h1>Users</h1>

      <div className="users-links">
        <span className="users-label">Users:</span>
        <div className="links-container">
          <button className={activeTab === "All" ? "active" : ""} onClick={() => setActiveTab("All")}>
            All
          </button>
          <button className={activeTab === "Active" ? "active" : ""} onClick={() => setActiveTab("Active")}>
            Active
          </button>
          <button className={activeTab === "Archived" ? "active" : ""} onClick={() => setActiveTab("Archived")}>
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
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <img src="/imgs/view.svg" alt="View" className="action-img" />
                        <img src="/imgs/edit.svg" alt="Edit" className="action-img" style={{ cursor: "pointer" }} />
                        {user.status !== "Archived" ? (
                          <img
                            src="/imgs/archive.svg"
                            alt="Archive"
                            className="action-img"
                            onClick={() => archiveUser(user.id)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <img
                            src="/imgs/restore.svg"
                            alt="Restore"
                            className="action-img"
                            onClick={() => restoreUser(user.id)}
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      </td>
                      <td>{user.id || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{getRoleDisplay(user)}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <span style={getStatusStyle(user.status)}>
                          {user.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {showArchiveDialog && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Confirm Archive</h3>
                  <p>Are you sure you want to archive this user?</p>
                  <div className="modal-buttons">
                    <button
                      onClick={confirmArchive}
                      className="confirm-btn"
                      disabled={loading}
                    >
                      {loading ? "Archiving..." : "Yes, Archive"}
                    </button>
                    <button
                      onClick={cancelArchive}
                      className="cancel-btn"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}