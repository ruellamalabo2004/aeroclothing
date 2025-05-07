import React, { useEffect, useState } from 'react';
import { ClipboardList, Package, RefreshCw, Truck, PackageCheck, CheckCircle, XCircle, RotateCcw, Search, Edit2, Archive } from 'lucide-react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        completed: 0,
        canceled: 0,
        returned: 0
    });
    const ordersPerPage = 10;

    // Configure axios defaults
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Fetch orders from the backend
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            const response = await axios.get('/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const ordersData = response.data;
            setOrders(ordersData);
            
            // Calculate order stats
            const stats = {
                total: ordersData.length,
                pending: ordersData.filter(order => order.status === 'Pending').length,
                processing: ordersData.filter(order => order.status === 'Processing').length,
                shipped: ordersData.filter(order => order.status === 'Shipped').length,
                delivered: ordersData.filter(order => order.status === 'Delivered').length,
                completed: ordersData.filter(order => order.status === 'Completed').length,
                canceled: ordersData.filter(order => order.status === 'Canceled').length,
                returned: ordersData.filter(order => order.status === 'Returned').length
            };
            setOrderStats(stats);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to fetch orders. Please try again later.');
            }
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Update order status
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            await axios.put(`/api/orders/${orderId}/status/${newStatus}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchOrders(); // Refresh orders after update
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to update order status. Please try again.');
            }
            console.error('Error updating order status:', err);
        }
    };

    // Archive order
    const handleArchive = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }

            await axios.patch(`/api/orders/${orderId}/archive`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchOrders(); // Refresh orders after archive
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to archive order. Please try again.');
            }
            console.error('Error archiving order:', err);
        }
    };

    // Filter orders based on search term
    const filteredOrders = orders.filter(
        (order) =>
            order.id.toString().includes(searchTerm) ||
            (order.profile?.name || 'N/A').toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.payment_method?.name || 'N/A').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalOrders = filteredOrders.length;
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (orderId) => {
        setSelectedOrders((prev) =>
            prev.includes(orderId)
                ? prev.filter((id) => id !== orderId)
                : [...prev, orderId]
        );
    };

    const stats = [
        { title: 'Total Orders', count: orderStats.total, icon: <ClipboardList className="orders__card-icon" /> },
        { title: 'Pending', count: orderStats.pending, icon: <Package className="orders__card-icon" /> },
        { title: 'Processing', count: orderStats.processing, icon: <RefreshCw className="orders__card-icon" /> },
        { title: 'Shipped', count: orderStats.shipped, icon: <Truck className="orders__card-icon" /> },
        { title: 'Delivered', count: orderStats.delivered, icon: <PackageCheck className="orders__card-icon" /> },
        { title: 'Completed', count: orderStats.completed, icon: <CheckCircle className="orders__card-icon" /> },
        { title: 'Canceled', count: orderStats.canceled, icon: <XCircle className="orders__card-icon" /> },
        { title: 'Returned', count: orderStats.returned, icon: <RotateCcw className="orders__card-icon" /> },
    ];

    if (loading) {
        return <div className="orders__loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="orders__error">{error}</div>;
    }

    return (
        <div className="orders">
            <h1 className="orders__title">Orders Management</h1>
            <div className="orders__grid">
                {stats.map((stat, index) => (
                    <div className="orders__card" key={index}>
                        <div className="orders__card-content">
                            <h2 className="orders__card-title">{stat.title}</h2>
                            <p className="orders__card-count">{stat.count}</p>
                        </div>
                        <div className="orders__card-icon-wrapper">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="orders__header">
                <div className="orders__controls">
                    <div className="orders__search-wrapper">
                        <Search size={16} className="orders__search-icon" />
                        <input
                            type="text"
                            className="orders__search"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="orders-table-wrapper">
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        onChange={() => {
                                            if (selectedOrders.length === currentOrders.length) {
                                                setSelectedOrders([]);
                                            } else {
                                                setSelectedOrders(currentOrders.map((o) => o.id));
                                            }
                                        }}
                                        checked={selectedOrders.length === currentOrders.length}
                                    />
                                </th>
                                <th scope="col">Actions</th>
                                <th scope="col">Order ID</th>
                                <th scope="col">Customer Name</th>
                                <th scope="col">Payment Method</th>
                                <th scope="col">Date</th>
                                <th scope="col">Total Amount</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleCheckboxChange(order.id)}
                                            />
                                        </td>
                                        <td>
                                            <Edit2
                                                className="action-img"
                                                size={16}
                                                onClick={() => handleStatusUpdate(order.id, 'Processing')}
                                            />
                                            <Archive
                                                className="action-img"
                                                size={16}
                                                onClick={() => handleArchive(order.id)}
                                            />
                                        </td>
                                        <td>#{order.id}</td>
                                        <td>{order.profile?.name || 'N/A'}</td>
                                        <td>{order.payment_method?.name || 'N/A'}</td>
                                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                        <td>
                                            ${parseFloat(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <span className={`status-frame status-${order.status.toLowerCase()}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No orders available</td>
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
        </div>
    );
};

export default Orders;