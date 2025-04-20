import React, { useState, useEffect } from 'react';
import { Search, Edit2, Archive } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;

    // Hardcoded sample transaction data
    useEffect(() => {
        const sampleTransactions = [
            { id: 1, transaction_id: 'TXN001', customer_name: 'John Doe', amount: 150.00, payment_method: 'Credit Card', date: '2025-04-18', status: 'Completed' },
            { id: 2, transaction_id: 'TXN002', customer_name: 'Jane Smith', amount: 200.50, payment_method: 'PayPal', date: '2025-04-17', status: 'Pending' },
            { id: 3, transaction_id: 'TXN003', customer_name: 'Alice Johnson', amount: 99.99, payment_method: 'Debit Card', date: '2025-04-16', status: 'Completed' },
            { id: 4, transaction_id: 'TXN004', customer_name: 'Bob Brown', amount: 300.00, payment_method: 'Credit Card', date: '2025-04-15', status: 'Failed' },
            { id: 5, transaction_id: 'TXN005', customer_name: 'Charlie Davis', amount: 75.25, payment_method: 'PayPal', date: '2025-04-14', status: 'Completed' },
            { id: 6, transaction_id: 'TXN006', customer_name: 'Diana Evans', amount: 120.00, payment_method: 'Credit Card', date: '2025-04-13', status: 'Pending' },
            { id: 7, transaction_id: 'TXN007', customer_name: 'Ethan Wilson', amount: 180.75, payment_method: 'Debit Card', date: '2025-04-12', status: 'Completed' },
            { id: 8, transaction_id: 'TXN008', customer_name: 'Fiona Clark', amount: 250.00, payment_method: 'PayPal', date: '2025-04-11', status: 'Failed' },
            { id: 9, transaction_id: 'TXN009', customer_name: 'George Harris', amount: 90.00, payment_method: 'Credit Card', date: '2025-04-10', status: 'Completed' },
            { id: 10, transaction_id: 'TXN010', customer_name: 'Hannah Lewis', amount: 110.00, payment_method: 'Debit Card', date: '2025-04-09', status: 'Pending' },
        ];
        setTransactions(sampleTransactions);
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
                                <th>Status</th>
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
                                            <span className={`status-frame status-${transaction.status.toLowerCase()}`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No transactions available</td>
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