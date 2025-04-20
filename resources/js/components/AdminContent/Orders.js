import React, { useEffect, useState } from 'react';
import { ClipboardList, Package, RefreshCw, Truck, PackageCheck, CheckCircle, XCircle, RotateCcw, Search, Edit2, Archive } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Hardcoded sample order data (replace with API fetch later)
    useEffect(() => {
        const sampleOrders = [
            { id: 1, order_number: 'ORD001', customer_name: 'John Doe', payment_method: 'Credit Card', date: '2025-04-18', total_price: 150.00, status: 'Processing' },
            { id: 2, order_number: 'ORD002', customer_name: 'Jane Smith', payment_method: 'PayPal', date: '2025-04-17', total_price: 200.50, status: 'Shipped' },
            { id: 3, order_number: 'ORD003', customer_name: 'Alice Johnson', payment_method: 'Debit Card', date: '2025-04-16', total_price: 99.99, status: 'Delivered' },
            { id: 4, order_number: 'ORD004', customer_name: 'Bob Brown', payment_method: 'Credit Card', date: '2025-04-15', total_price: 300.00, status: 'Completed' },
            { id: 5, order_number: 'ORD005', customer_name: 'Charlie Davis', payment_method: 'PayPal', date: '2025-04-14', total_price: 75.25, status: 'Canceled' },
            { id: 6, order_number: 'ORD006', customer_name: 'Diana Evans', payment_method: 'Credit Card', date: '2025-04-13', total_price: 120.00, status: 'Returned' },
            { id: 7, order_number: 'ORD007', customer_name: 'Ethan Wilson', payment_method: 'Debit Card', date: '2025-04-12', total_price: 180.75, status: 'Pending' },
            { id: 8, order_number: 'ORD008', customer_name: 'Fiona Clark', payment_method: 'PayPal', date: '2025-04-11', total_price: 250.00, status: 'Processing' },
            { id: 9, order_number: 'ORD009', customer_name: 'George Harris', payment_method: 'Credit Card', date: '2025-04-10', total_price: 90.00, status: 'Shipped' },
            { id: 10, order_number: 'ORD010', customer_name: 'Hannah Lewis', payment_method: 'Debit Card', date: '2025-04-09', total_price: 110.00, status: 'Delivered' },
        ];
        setOrders(sampleOrders);
    }, []);

    // Filter orders based on search term
    const filteredOrders = orders.filter(
        (order) =>
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
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

    const orderStats = [
        { title: 'Total Orders', count: 241, icon: <ClipboardList className="orders__card-icon" /> },
        { title: 'Pending', count: 12, icon: <Package className="orders__card-icon" /> },
        { title: 'Processing', count: 8, icon: <RefreshCw className="orders__card-icon" /> },
        { title: 'Shipped', count: 15, icon: <Truck className="orders__card-icon" /> },
        { title: 'Delivered', count: 45, icon: <PackageCheck className="orders__card-icon" /> },
        { title: 'Completed', count: 156, icon: <CheckCircle className="orders__card-icon" /> },
        { title: 'Canceled', count: 3, icon: <XCircle className="orders__card-icon" /> },
        { title: 'Returned', count: 2, icon: <RotateCcw className="orders__card-icon" /> },
    ];

    return (
        <div className="orders">
            <h1 className="orders__title">Orders Management</h1>
            <div className="orders__grid">
                {orderStats.map((stat, index) => (
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
                                                onClick={() => console.log('Edit action not implemented yet')}
                                            />
                                            <Archive
                                                className="action-img"
                                                size={16}
                                                onClick={() => console.log('Archive action not implemented yet')}
                                            />
                                        </td>
                                        <td>{order.order_number}</td>
                                        <td>{order.customer_name}</td>
                                        <td>{order.payment_method}</td>
                                        <td>{order.date}</td>
                                        <td>
                                            ${parseFloat(order.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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