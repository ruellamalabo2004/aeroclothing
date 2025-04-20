import React, { useState, useEffect } from 'react';
import { Search, MessageSquareReply, Edit2, Archive } from 'lucide-react';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const messagesPerPage = 10;

    // Hardcoded sample inbox message data
    useEffect(() => {
        const sampleMessages = [
            { id: 1, subject: 'Order Confirmation', sender: 'John Doe', date: '2025-04-18', status: 'Read' },
            { id: 2, subject: 'Support Request', sender: 'Jane Smith', date: '2025-04-17', status: 'Unread' },
            { id: 3, subject: 'Payment Issue', sender: 'Alice Johnson', date: '2025-04-16', status: 'Read' },
            { id: 4, subject: 'Product Inquiry', sender: 'Bob Brown', date: '2025-04-15', status: 'Archived' },
            { id: 5, subject: 'Return Request', sender: 'Charlie Davis', date: '2025-04-14', status: 'Read' },
            { id: 6, subject: 'Feedback', sender: 'Diana Evans', date: '2025-04-13', status: 'Unread' },
            { id: 7, subject: 'Order Update', sender: 'Ethan Wilson', date: '2025-04-12', status: 'Read' },
            { id: 8, subject: 'Complaint', sender: 'Fiona Clark', date: '2025-04-11', status: 'Archived' },
            { id: 9, subject: 'Shipping Query', sender: 'George Harris', date: '2025-04-10', status: 'Read' },
            { id: 10, subject: 'Account Issue', sender: 'Hannah Lewis', date: '2025-04-09', status: 'Unread' },
        ];
        setMessages(sampleMessages);
    }, []);

    // Filter messages based on search term
    const filteredMessages = messages.filter(
        (message) =>
            message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            message.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalMessages = filteredMessages.length;
    const totalPages = Math.ceil(totalMessages / messagesPerPage);
    const startIndex = (currentPage - 1) * messagesPerPage;
    const currentMessages = filteredMessages.slice(startIndex, startIndex + messagesPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (messageId) => {
        setSelectedMessages((prev) =>
            prev.includes(messageId)
                ? prev.filter((id) => id !== messageId)
                : [...prev, messageId]
        );
    };

    return (
        <div className="inbox">
            <div className="inbox__header">
                <div>
                    <h2 className="inbox__title">Inbox</h2>
                    <p className="inbox__subtitle">Select messages to perform bulk actions</p>
                </div>

                <div className="inbox__controls">
                    <div className="inbox__search-wrapper">
                        <Search size={16} className="inbox__search-icon" />
                        <input
                            type="text"
                            className="inbox__search"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="inbox-table-wrapper">
                <div className="inbox-table-container">
                    <table className="inbox-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={() =>
                                            setSelectedMessages(
                                                selectedMessages.length === currentMessages.length
                                                    ? []
                                                    : currentMessages.map((m) => m.id)
                                            )
                                        }
                                        checked={selectedMessages.length === currentMessages.length && currentMessages.length > 0}
                                    />
                                </th>
                                <th>Actions</th>
                                <th>Subject</th>
                                <th>Sender</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMessages.length > 0 ? (
                                currentMessages.map((message) => (
                                    <tr key={message.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedMessages.includes(message.id)}
                                                onChange={() => handleCheckboxChange(message.id)}
                                            />
                                        </td>
                                        <td>
                                            <MessageSquareReply
                                                className="action-img"
                                                size={16}
                                                onClick={() => console.log('Reply action not implemented yet')}
                                            />
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
                                        <td>{message.subject}</td>
                                        <td>{message.sender}</td>
                                        <td>{message.date}</td>
                                        <td>
                                            <span className={`status-frame status-${message.status.toLowerCase()}`}>
                                                {message.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No messages available</td>
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

export default Inbox;