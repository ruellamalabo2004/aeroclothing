import React, { useState, useEffect } from "react";

export default function Users() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: "",
    role: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "customer",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    password: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users from API (unchanged)
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
      console.log("API Response:", data);
      const userData = Array.isArray(data) ? data : data.data || [];

      const processedUsers = userData.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status || "Active",
        created_at: user.created_at,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
      }));

      setUsers(processedUsers);
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

  // Archive User (unchanged)
  const archiveUser = (userId) => {
    setUserToArchive(userId);
    setShowArchiveDialog(true);
  };

  const confirmArchive = async () => {
    if (!userToArchive) return;

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userToArchive}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to archive user: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      setUsers(users.map((user) => (user.id === userToArchive ? { ...user, status: "Archived" } : user)));
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
    setShowArchiveDialog(false);
    setUserToArchive(null);
  };

  // Restore Archived User (unchanged)
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
        throw new Error(`Failed to restore user: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "Active" } : user)));
      setError(null);
    } catch (error) {
      console.error("Error restoring user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit User functionality (unchanged)
  const editUser = (user) => {
    setUserToEdit(user.id);
    setEditFormData({
      email: user.email || "",
      role: user.role || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone_number: user.phone_number || "",
      gender: user.gender || "",
      date_of_birth: user.date_of_birth?.split("T")[0] || "",
    });
    setShowEditDialog(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!userToEdit) return;

    try {
      setLoading(true);

      const userData = {
        email: editFormData.email,
        role: editFormData.role,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        phone_number: editFormData.phone_number,
        gender: editFormData.gender,
        date_of_birth: editFormData.date_of_birth || null,
      };

      const response = await fetch(`http://127.0.0.1:8000/api/users/${userToEdit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update user: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      const updatedUser = await response.json();
      console.log("Updated User Response:", updatedUser);

      setUsers(users.map((user) =>
        user.id === userToEdit
          ? {
              ...user,
              email: updatedUser.data.email || user.email,
              role: updatedUser.data.role || user.role,
              first_name: updatedUser.data.first_name || user.first_name,
              last_name: updatedUser.data.last_name || user.last_name,
              phone_number: updatedUser.data.phone_number || user.phone_number,
              gender: updatedUser.data.gender || user.gender,
              date_of_birth: updatedUser.data.date_of_birth || user.date_of_birth,
            }
          : user
      ));
      setShowEditDialog(false);
      setUserToEdit(null);
      setError(null);
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setShowEditDialog(false);
    setUserToEdit(null);
  };

  // Add User functionality (unchanged)
  const handleAddUser = () => {
    setShowAddDialog(true);
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async () => {
    try {
      setLoading(true);

      const userData = {
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number,
        gender: newUser.gender,
        date_of_birth: newUser.date_of_birth || null,
        password: newUser.password || "defaultpassword",
      };

      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add user: ${response.status} - ${errorData.message || "Unknown error"}`);
      }

      const createdUser = await response.json();
      setUsers((prev) => [
        ...prev,
        {
          id: createdUser.data.id,
          email: createdUser.data.email,
          role: createdUser.data.role,
          status: createdUser.data.status || "Active",
          created_at: createdUser.data.created_at,
          first_name: createdUser.data.first_name || "",
          last_name: createdUser.data.last_name || "",
          phone_number: createdUser.data.phone_number || "",
          gender: createdUser.data.gender || "",
          date_of_birth: createdUser.data.date_of_birth || "",
        },
      ]);
      setShowAddDialog(false);
      setNewUser({
        email: "",
        role: "customer",
        first_name: "",
        last_name: "",
        phone_number: "",
        gender: "",
        date_of_birth: "",
        password: "",
      });
      setError(null);
    } catch (error) {
      console.error("Error adding user:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelAdd = () => {
    setShowAddDialog(false);
    setNewUser({
      email: "",
      role: "customer",
      first_name: "",
      last_name: "",
      phone_number: "",
      gender: "",
      date_of_birth: "",
      password: "",
    });
  };

  const getRoleDisplay = (user) => {
    return user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "N/A";
  };

  const filteredUsers = users.filter((user) => {
    const isActive = user.status === "Active";
    const isArchived = user.status === "Archived";
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Archived" ? isArchived : activeTab === "Active" ? isActive : false);
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Modified to show only date without time
  const formatDate = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleDateString() : "N/A";

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
          placeholder="Search users by email, first name, or last name..."
          className="users-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-user-btn" onClick={handleAddUser}>
          Add User
        </button>
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
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <img
                        src="/imgs/editing.svg"
                        alt="Edit"
                        className="action-img"
                        onClick={() => editUser(user)}
                        style={{ cursor: "pointer" }}
                      />
                      {user.status !== "Archived" ? (
                        <img
                          src="/imgs/archiving.svg"
                          alt="Archive"
                          className="action-img"
                          onClick={() => archiveUser(user.id)}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <img
                          src="/imgs/revert.svg"
                          alt="Restore"
                          className="action-img"
                          onClick={() => restoreUser(user.id)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                    <td>{user.id || "N/A"}</td>
                    <td>{user.first_name || "N/A"}</td>
                    <td>{user.last_name || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.phone_number || "N/A"}</td>
                    <td>{user.gender || "N/A"}</td>
                    <td>{formatDate(user.date_of_birth)}</td>
                    <td>
                      <span className={`role-frame role-${user.role?.toLowerCase()}`}>
                        {getRoleDisplay(user)}
                      </span>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <span className={`status-frame status-${user.status?.toLowerCase()}`}>
                        {user.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {users.length > 0 && !loading && !error && (
        <div className="pagination">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showArchiveDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Archive</h3>
            <p>Are you sure you want to archive this user?</p>
            <div className="modal-buttons">
              <button onClick={confirmArchive} className="confirm-btn" disabled={loading}>
                {loading ? "Archiving..." : "Yes, Archive"}
              </button>
              <button onClick={cancelArchive} className="cancel-btn" disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDialog && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit User</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editFormData.first_name}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editFormData.last_name}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={editFormData.phone_number}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender:</label>
                  <select
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editFormData.date_of_birth}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    disabled={loading}
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddDialog && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Add New User</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveAdd(); }}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name:</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newUser.first_name}
                    onChange={handleAddInputChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newUser.last_name}
                    onChange={handleAddInputChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleAddInputChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={newUser.phone_number}
                    onChange={handleAddInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender:</label>
                  <select
                    name="gender"
                    value={newUser.gender}
                    onChange={handleAddInputChange}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={newUser.date_of_birth}
                    onChange={handleAddInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role:</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleAddInputChange}
                    disabled={loading}
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleAddInputChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={cancelAdd} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}