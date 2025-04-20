import React, { useState, useEffect } from 'react';
import { Search, MessageSquareReply, Edit2, Archive } from 'lucide-react';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReviews, setSelectedReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 10;

    // Hardcoded sample review data with status
    useEffect(() => {
        const sampleReviews = [
            { id: 1, customer_name: 'John Doe', product_bought: 'Wireless Earbuds', review: 'Great sound quality!', rate: 5, date: '2025-04-18', status: 'Replied' },
            { id: 2, customer_name: 'Jane Smith', product_bought: 'Smart Watch', review: 'Battery life could be better.', rate: 3, date: '2025-04-17', status: 'Replied' },
            { id: 3, customer_name: 'Alice Johnson', product_bought: 'Portable Speaker', review: 'Stopped working after a week.', rate: 1, date: '2025-04-16', status: 'Archived' },
            { id: 4, customer_name: 'Bob Brown', product_bought: 'Fitness Tracker', review: 'Very accurate tracking.', rate: 4, date: '2025-04-15', status: 'Replied' },
            { id: 5, customer_name: 'Charlie Davis', product_bought: 'Laptop Stand', review: 'Sturdy but a bit bulky.', rate: 3, date: '2025-04-14', status: 'Archived' },
            { id: 6, customer_name: 'Diana Evans', product_bought: 'Bluetooth Headphones', review: 'Amazing comfort and sound.', rate: 5, date: '2025-04-13', status: 'Replied' },
            { id: 7, customer_name: 'Ethan Wilson', product_bought: 'USB-C Hub', review: 'Ports are unreliable.', rate: 2, date: '2025-04-12', status: 'Archived' },
            { id: 8, customer_name: 'Fiona Clark', product_bought: 'Wireless Mouse', review: 'Smooth and responsive.', rate: 4, date: '2025-04-11', status: 'Replied' },
            { id: 9, customer_name: 'George Harris', product_bought: 'Keyboard', review: 'Keys feel cheap.', rate: 2, date: '2025-04-10', status: 'Archived' },
            { id: 10, customer_name: 'Hannah Lewis', product_bought: 'Monitor', review: 'Good display but average build.', rate: 3, date: '2025-04-09', status: 'Replied' },
        ];
        setReviews(sampleReviews);
    }, []);

    // Filter reviews based on search term
    const filteredReviews = reviews.filter(
        (review) =>
            review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.product_bought.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalReviews = filteredReviews.length;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const currentReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckboxChange = (reviewId) => {
        setSelectedReviews((prev) =>
            prev.includes(reviewId)
                ? prev.filter((id) => id !== reviewId)
                : [...prev, reviewId]
        );
    };

    return (
        <div className="reviews">
            <div className="reviews__header">
                <div>
                    <h2 className="reviews__title">Reviews</h2>
                    <p className="reviews__subtitle">Select reviews to perform bulk actions</p>
                </div>

                <div className="reviews__controls">
                    <div className="reviews__search-wrapper">
                        <Search size={16} className="reviews__search-icon" />
                        <input
                            type="text"
                            className="reviews__search"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="reviews-table-wrapper">
                <div className="reviews-table-container">
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={() =>
                                            setSelectedReviews(
                                                selectedReviews.length === currentReviews.length
                                                    ? []
                                                    : currentReviews.map((r) => r.id)
                                            )
                                        }
                                        checked={selectedReviews.length === currentReviews.length && currentReviews.length > 0}
                                    />
                                </th>
                                <th>Actions</th>
                                <th>Customer Name</th>
                                <th>Product Bought</th>
                                <th>Review</th>
                                <th>Rate</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReviews.length > 0 ? (
                                currentReviews.map((review) => (
                                    <tr key={review.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedReviews.includes(review.id)}
                                                onChange={() => handleCheckboxChange(review.id)}
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
                                        <td>{review.customer_name}</td>
                                        <td>{review.product_bought}</td>
                                        <td>{review.review}</td>
                                        <td>{review.rate}</td>
                                        <td>{review.date}</td>
                                        <td>
                                            <span className={`status-frame status-${review.status.toLowerCase()}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No reviews available</td>
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

export default Reviews;