import React, { useState, useEffect } from "react";
import axios from "axios";
import { Archive, Plus, Search, Edit2, RotateCcw, User } from 'lucide-react';
import UserModal from './UserModal';
import EditUserModal from './EditUserModal';
import Success from '../LoginContent/Success';

const Users = ({ token }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const usersPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Fetched users:', res.data);
            setUsers(res.data || []);
            setErrorMessage('');
        } catch (err) {
            console.error('Failed to fetch users:', err.response?.data || err.message);
            setErrorMessage(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleAction = async (userId, status, action) => {
        try {
            const url = action === 'restore'
                ? `http://localhost:8000/api/users/${userId}/restore`
                : `http://localhost:8000/api/users/${userId}/archive`;

            const res = await axios.patch(
                url,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            console.log(`${action} response:`, res.data);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, status: action === 'archive' ? 'archived' : 'active' } : u
                )
            );
            setSuccessMessage(`User ${action}d successfully!`);
            setIsSuccessVisible(true);
            fetchUsers();
        } catch (err) {
            console.error(`Failed to ${action} user:`, err.response?.data || err.message);
            setErrorMessage(`Failed to ${action} user: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleBulkArchive = async () => {
        if (selectedUsers.length === 0) {
            setErrorMessage('No users selected for archiving.');
            return;
        }

        try {
            const archivePromises = selectedUsers.map((userId) =>
                axios.patch(
                    `http://localhost:8000/api/users/${userId}/archive`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        }
                    }
                )
            );

            const results = await Promise.allSettled(archivePromises);
            const failures = results.filter((result) => result.status === 'rejected');

            if (failures.length > 0) {
                const errorMessages = failures.map((f) => f.reason.response?.data?.message || 'Unknown error');
                setErrorMessage(`Failed to archive some users: ${errorMessages.join(', ')}`);
            } else {
                setSuccessMessage(`Selected users (${selectedUsers.length}) archived successfully!`);
                setIsSuccessVisible(true);
                setUsers((prev) =>
                    prev.map((u) =>
                        selectedUsers.includes(u.id) ? { ...u, status: 'archived' } : u
                    )
                );
            }

            setSelectedUsers([]);
            fetchUsers();
        } catch (err) {
            console.error('Failed to bulk archive users:', err.response?.data || err.message);
            setErrorMessage(`Failed to bulk archive users: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleUserUpdated = (updatedUser) => {
        console.log('User updated, updating local state:', updatedUser);
        setUsers((prev) =>
            prev.map((u) =>
                u.id === updatedUser.id
                    ? {
                          ...u,
                          email: updatedUser.email,
                          role: updatedUser.role,
                          status: updatedUser.status,
                          first_name: updatedUser.first_name,
                          middle_name: updatedUser.middle_name,
                          last_name: updatedUser.last_name,
                          suffix: updatedUser.suffix,
                          gender: updatedUser.gender,
                          date_of_birth: updatedUser.date_of_birth,
                          profile_pic: updatedUser.profile_pic,
                          full_name: `${updatedUser.first_name || ''} ${updatedUser.middle_name || ''} ${updatedUser.last_name || ''} ${updatedUser.suffix || ''}`.trim(),
                      }
                    : u
            )
        );
        fetchUsers();
    };

    const filteredUsers = users.filter(
        (user) =>
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (showArchived ? user.status === 'archived' : user.status === 'active')
    );

    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="users">
            <div className="users__header">
                <div>
                    <h2 className="users__title">User Management</h2>
                    <p className="users__subtitle">Select users to perform bulk actions</p>
                </div>

                <div className="users__controls">
                    <div className="users__search-wrapper">
                        <Search size={16} className="users__search-icon" />
                        <input
                            type="text"
                            className="users__search"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="users__actions">
                        <button
                            className="users__button users__button--secondary"
                            onClick={() => {
                                setShowArchived(!showArchived);
                                setCurrentPage(1);
                            }}
                        >
                            <Archive size={16} className="users__button-icon" />
                            {showArchived ? 'View Active' : 'View Archived'}
                        </button>
                        {selectedUsers.length > 0 && !showArchived && (
                            <button
                                className="users__button users__button--secondary"
                                onClick={handleBulkArchive}
                            >
                                <Archive size={16} className="users__button-icon" />
                                Archive Selected ({selectedUsers.length})
                            </button>
                        )}
                        <button
                            className="users__button users__button--primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={16} className="users__button-icon" />
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <div style={{ margin: '10px 0', padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {errorMessage}
                </div>
            )}

            <Success
                message={successMessage}
                isVisible={isSuccessVisible}
                onClose={() => setIsSuccessVisible(false)}
            />

            <div className="users-table-wrapper">
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={() =>
                                            setSelectedUsers(
                                                selectedUsers.length === currentUsers.length
                                                    ? []
                                                    : currentUsers.map((u) => u.id)
                                            )
                                        }
                                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                    />
                                </th>
                                <th>Actions</th>
                                <th>Profile</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Gender</th>
                                <th>Date of Birth</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleCheckboxChange(user.id)}
                                            />
                                        </td>
                                        <td>
                                            <Edit2
                                                className="action-img"
                                                size={16}
                                                onClick={() => handleEdit(user.id)}
                                            />
                                            <span
                                                className="action-img"
                                                onClick={() =>
                                                    handleAction(
                                                        user.id,
                                                        user.status,
                                                        user.status === 'archived' ? 'restore' : 'archive'
                                                    )
                                                }
                                            >
                                                {user.status === 'archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
                                            </span>
                                        </td>
                                        <td>
                                            {user.profile_pic ? (
                                                <img
                                                    src={`http://localhost:8000/storage/${user.profile_pic}`}
                                                    alt={user.full_name}
                                                    className="user-image"
                                                    onError={(e) => {
                                                        e.target.src = '/api/placeholder/40/40';
                                                    }}
                                                />
                                            ) : (
                                                <User size={24} className="user-icon" />
                                            )}
                                        </td>
                                        <td>{user.full_name?.trim() || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>{user.gender || 'N/A'}</td>
                                        <td>{formatDate(user.date_of_birth)}</td>
                                        <td>
                                            <span className={`role-frame role-${user.role}`}>
                                                {user.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-frame status-${user.status}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No users available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                token={token}
                onUserAdded={fetchUsers}
            />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
                token={token}
                onUserUpdated={handleUserUpdated}
            />
        </div>
    );
};

export default Users;