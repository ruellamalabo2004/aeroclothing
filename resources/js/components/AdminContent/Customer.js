import React, { useState, useEffect } from "react";
import axios from "axios";
import { Archive, Plus, Search, Edit2, RotateCcw, User } from 'lucide-react';
import CustomerModal from './CustomerModal';
import EditCustomerModal from './EditCustomerModal';
import Success from '../LoginContent/Success';

const Customers = ({ token }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const customersPerPage = 10;

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/customers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Fetched customers:', res.data);
            
            const processedCustomers = Array.isArray(res.data) ? res.data : (res.data.data || []);
            
            const normalizedCustomers = processedCustomers.map(customer => ({
                ...customer,
                roles: customer.roles ? customer.roles : ['customer'],
                status: customer.status ? (
                    customer.status.charAt(0).toUpperCase() + customer.status.slice(1).toLowerCase()
                ) : 'Active',
                full_name: customer.full_name || (
                    `${customer.profile?.first_name || ''} ${customer.profile?.middle_name || ''} ${customer.profile?.last_name || ''} ${customer.profile?.suffix || ''}`
                ).trim()
            }));
            
            setCustomers(normalizedCustomers);
            setErrorMessage('');
        } catch (err) {
            console.error('Failed to fetch customers:', err.response?.data || err.message);
            setErrorMessage(`Failed to fetch customers: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleAction = async (customerId, status, action) => {
        try {
            const url = action === 'restore'
                ? `http://localhost:8000/api/users/${customerId}/restore`
                : `http://localhost:8000/api/users/${customerId}/archive`;

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
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === customerId ? { 
                        ...c, 
                        status: action === 'archive' ? 'Archived' : 'Active' 
                    } : c
                )
            );
            setSuccessMessage(`Customer ${action}d successfully!`);
            setIsSuccessVisible(true);
            fetchCustomers(); // Refresh in the background
        } catch (err) {
            console.error(`Failed to ${action} customer:`, err.response?.data || err.message);
            setErrorMessage(`Failed to ${action} customer: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleBulkArchive = async () => {
        if (selectedCustomers.length === 0) {
            setErrorMessage('No customers selected for archiving.');
            return;
        }

        try {
            const archivePromises = selectedCustomers.map((customerId) =>
                axios.patch(
                    `http://localhost:8000/api/users/${customerId}/archive`,
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
                setErrorMessage(`Failed to archive some customers: ${errorMessages.join(', ')}`);
            } else {
                setSuccessMessage(`Selected customers (${selectedCustomers.length}) archived successfully!`);
                setIsSuccessVisible(true);
                setCustomers((prev) =>
                    prev.map((c) =>
                        selectedCustomers.includes(c.id) ? { ...c, status: 'Archived' } : c
                    )
                );
            }

            setSelectedCustomers([]);
            fetchCustomers(); // Refresh in the background
        } catch (err) {
            console.error('Failed to bulk archive customers:', err.response?.data || err.message);
            setErrorMessage(`Failed to bulk archive customers: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (customerId) => {
        setSelectedCustomerId(customerId);
        setIsEditModalOpen(true);
    };

    const handleCustomerUpdated = (updatedCustomer) => {
        console.log('Customer updated, updating local state:', updatedCustomer);
        
        const roles = updatedCustomer.roles || ['customer'];
        
        setCustomers((prev) =>
            prev.map((c) =>
                c.id === updatedCustomer.id
                    ? {
                          ...c,
                          email: updatedCustomer.email,
                          status: updatedCustomer.status,
                          first_name: updatedCustomer.first_name || updatedCustomer.profile?.first_name,
                          middle_name: updatedCustomer.middle_name || updatedCustomer.profile?.middle_name,
                          last_name: updatedCustomer.last_name || updatedCustomer.profile?.last_name,
                          suffix: updatedCustomer.suffix || updatedCustomer.profile?.suffix,
                          gender: updatedCustomer.gender || updatedCustomer.profile?.gender,
                          date_of_birth: updatedCustomer.date_of_birth || updatedCustomer.profile?.date_of_birth,
                          profile_pic: updatedCustomer.profile_pic || updatedCustomer.profile?.profile_pic,
                          full_name: `${(updatedCustomer.first_name || updatedCustomer.profile?.first_name || '')} ${(updatedCustomer.middle_name || updatedCustomer.profile?.middle_name || '')} ${(updatedCustomer.last_name || updatedCustomer.profile?.last_name || '')} ${(updatedCustomer.suffix || updatedCustomer.profile?.suffix || '')}`.trim(),
                          roles: roles,
                      }
                    : c
            )
        );
        setSuccessMessage('Customer updated successfully!');
        setIsSuccessVisible(true);
        fetchCustomers(); // Refresh in the background
    };

    const filteredCustomers = customers.filter(
        (customer) =>
            (customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             customer.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (showArchived ? customer.status === 'Archived' : customer.status === 'Active')
    );

    const totalCustomers = filteredCustomers.length;
    const totalPages = Math.ceil(totalCustomers / customersPerPage);
    const startIndex = (currentPage - 1) * customersPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, startIndex + customersPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (customerId) => {
        setSelectedCustomers((prev) =>
            prev.includes(customerId)
                ? prev.filter((id) => id !== customerId)
                : [...prev, customerId]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const normalizeStatus = (status) => {
        if (!status) return 'N/A';
        return {
            cssClass: status.toLowerCase(),
            displayText: status
        };
    };

    return (
        <div className="customers">
            <div className="customers__header">
                <div>
                    <h2 className="customers__title">Customer Management</h2>
                    <p className="customers__subtitle">Select customers to perform bulk actions</p>
                </div>

                <div className="customers__controls">
                    <div className="customers__search-wrapper">
                        <Search size={16} className="customers__search-icon" />
                        <input
                            type="text"
                            className="customers__search"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    <div className="customers__actions">
                        <button
                            className="customers__button customers__button--secondary"
                            onClick={() => {
                                setShowArchived(!showArchived);
                                setCurrentPage(1);
                            }}
                        >
                            <Archive size={16} className="customers__button-icon" />
                            {showArchived ? 'View Active' : 'View Archived'}
                        </button>
                        {selectedCustomers.length > 0 && !showArchived && (
                            <button
                                className="customers__button customers__button--secondary"
                                onClick={handleBulkArchive}
                            >
                                <Archive size={16} className="customers__button-icon" />
                                Archive Selected ({selectedCustomers.length})
                            </button>
                        )}
                        <button
                            className="customers__button customers__button--primary"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={16} className="customers__button-icon" />
                            Add Customer
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

            <div className="customers-table-wrapper">
                <div className="customers-table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={() =>
                                            setSelectedCustomers(
                                                selectedCustomers.length === currentCustomers.length
                                                    ? []
                                                    : currentCustomers.map((c) => c.id)
                                            )
                                        }
                                        checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
                                    />
                                </th>
                                <th>Actions</th>
                                <th>Profile</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Gender</th>
                                <th>Date of Birth</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCustomers.length > 0 ? (
                                currentCustomers.map((customer) => {
                                    const status = normalizeStatus(customer.status);
                                    const roleDisplay = customer.roles?.[0] || 'customer';
                                    
                                    return (
                                        <tr key={customer.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(customer.id)}
                                                    onChange={() => handleCheckboxChange(customer.id)}
                                                />
                                            </td>
                                            <td>
                                                <Edit2
                                                    className="action-img"
                                                    size={16}
                                                    onClick={() => handleEdit(customer.id)}
                                                />
                                                <span
                                                    className="action-img"
                                                    onClick={() =>
                                                        handleAction(
                                                            customer.id,
                                                            customer.status,
                                                            customer.status === 'Archived' ? 'restore' : 'archive'
                                                        )
                                                    }
                                                >
                                                    {customer.status === 'Archived' ? <RotateCcw size={16} /> : <Archive size={16} />}
                                                </span>
                                            </td>
                                            <td>
                                                {customer.profile_pic ? (
                                                    <img
                                                        src={`http://localhost:8000/storage/${customer.profile_pic}`}
                                                        alt={customer.full_name}
                                                        className="customer-image"
                                                        onError={(e) => {
                                                            e.target.src = '/api/placeholder/40/40';
                                                        }}
                                                    />
                                                ) : (
                                                    <User size={24} className="customer-icon" />
                                                )}
                                            </td>
                                            <td>{customer.full_name?.trim() || 'N/A'}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.gender || 'N/A'}</td>
                                            <td>{formatDate(customer.date_of_birth)}</td>
                                            <td>
                                                <span className={`role-frame role-${roleDisplay.toLowerCase()}`}>
                                                    {roleDisplay}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-frame status-${status.cssClass}`}>
                                                    {status.displayText}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9">No customers available</td>
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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                token={token}
                onCustomerAdded={fetchCustomers}
            />
            <EditCustomerModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCustomerId(null);
                }}
                customerId={selectedCustomerId}
                token={token}
                onCustomerUpdated={handleCustomerUpdated}
            />
        </div>
    );
};

export default Customers;