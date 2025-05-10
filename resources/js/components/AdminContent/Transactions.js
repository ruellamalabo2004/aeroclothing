import React, { useState, useEffect } from 'react';
import { Search, Edit2, Archive } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;

    // Helper to determine payment status
    const getPaymentStatus = (paymentMethod) => {
        if (!paymentMethod) return 'Unpaid';
        const paidMethods = ['Credit Card', 'PayPal'];
        return paidMethods.includes(paymentMethod) ? 'Paid' : 'Unpaid';
    };

    // Fetch transactions from API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/transactions', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setTransactions(data);
            } catch (err) {
                setTransactions([]);
            }
        };
        fetchTransactions();
    }, []);

    // Filter transactions based on search term
    const filteredTransactions = transactions.filter(
        (transaction) =>
            transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (transactionId) => {
        setSelectedTransactions((prev) =>
            prev.includes(transactionId)
                ? prev.filter((id) => id !== transactionId)
                : [...prev, transactionId]
        );
    };

    // Helper for status frame class
    const getStatusFrameClass = (status) => {
        if (!status) return 'status-frame';
        return `status-frame status-${status.toLowerCase()}`;
    };

    return (
        <div className="transactions">
            <div className="transactions__header">
                <div>
                    <h2 className="transactions__title">Transactions</h2>
                    <p className="transactions__subtitle">Select transactions to perform bulk actions</p>
                </div>

                <div className="transactions__controls">
                    <div className="transactions__search-wrapper">
                        <Search size={16} className="transactions__search-icon" />
                        <input
                            type="text"
                            className="transactions__search"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="transactions-table-wrapper">
                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={() =>
                                            setSelectedTransactions(
                                                selectedTransactions.length === currentTransactions.length
                                                    ? []
                                                    : currentTransactions.map((t) => t.id)
                                            )
                                        }
                                        checked={selectedTransactions.length === currentTransactions.length && currentTransactions.length > 0}
                                    />
                                </th>
                                <th>Actions</th>
                                <th>Transaction ID</th>
                                <th>Customer Name</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Date</th>
                                <th>Order Status</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTransactions.length > 0 ? (
                                currentTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedTransactions.includes(transaction.id)}
                                                onChange={() => handleCheckboxChange(transaction.id)}
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
                                        <td>{transaction.transaction_id}</td>
                                        <td>{transaction.customer_name}</td>
                                        <td>
                                            ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>{transaction.payment_method}</td>
                                        <td>{transaction.date}</td>
                                        <td>
                                            <span className={getStatusFrameClass(transaction.status)}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-frame status-${getPaymentStatus(transaction.payment_method).toLowerCase()}`}>
                                                {getPaymentStatus(transaction.payment_method)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9">No transactions available</td>
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

export default Transactions;