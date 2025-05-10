import React, { useState, useEffect } from 'react';
import { Search, MessageSquareReply, Edit2, Archive } from 'lucide-react';
import axios from 'axios';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReviews, setSelectedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const reviewsPerPage = 10;
    const API_URL = "http://127.0.0.1:8000/api";

    // Fetch reviews from API
    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            console.log('Fetching reviews from API...');
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            console.log('Auth token available:', !!token);
            
            // Set headers with token if available
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            // Get all reviews
            const response = await axios.get(`${API_URL}/reviews`, { headers });
            console.log('API Response:', response);
            
            if (response.data && response.data.length > 0) {
                console.log(`Received ${response.data.length} reviews`);
                
                // Format the reviews data for display
                const formattedReviews = response.data.map(review => {
                    // Get user name from the user relationship
                    let customerName = 'Anonymous';
                    if (review.user) {
                        if (review.user.name) {
                            customerName = review.user.name;
                        } else if (review.user.profile) {
                            // Try to get from profile if exists
                            const firstName = review.user.profile.first_name || '';
                            const lastName = review.user.profile.last_name || '';
                            if (firstName || lastName) {
                                customerName = `${firstName} ${lastName}`.trim();
                            }
                        }
                    }
                    
                    // Get product name from the product relationship
                    let productName = 'Unknown Product';
                    if (review.product && review.product.product_name) {
                        productName = review.product.product_name;
                    } else if (review.product_id) {
                        productName = `Product #${review.product_id}`;
                    }
                    
                    return {
                        id: review.id,
                        customer_name: customerName,
                        product_bought: productName,
                        review: review.review || "No review text",
                        rating: review.rating || 0,
                        reply: review.reply,
                        status: review.reply ? "Replied" : "Pending",
                        date: new Date(review.created_at).toLocaleDateString(),
                        created_at: review.created_at,
                        updated_at: review.updated_at,
                        user_id: review.user_id,
                        product_id: review.product_id,
                        order_id: review.order_id
                    };
                });
                
                setReviews(formattedReviews);
            } else {
                console.log('No reviews found or invalid response format');
                setReviews([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to fetch reviews. Please check the console for details.');
            setLoading(false);
        }
    };

    // Handle replying to a review
    const handleReplyClick = (review) => {
        setSelectedReview(review);
        setReplyText(review.reply || "");
    };
    
    // Close the modal
    const handleCloseModal = () => {
        setSelectedReview(null);
        setReplyText("");
    };
    
    // Save reply (would connect to backend in real implementation)
    const handleSaveReply = () => {
        if (!selectedReview || !replyText.trim()) return;
        
        // Update in local state for now (would connect to API in real implementation)
        setReviews(reviews.map(review => 
            review.id === selectedReview.id 
                ? { ...review, reply: replyText, status: "Replied" } 
                : review
        ));
        
        // Close modal
        setSelectedReview(null);
        setReplyText("");
    };

    // Filter reviews based on search term
    const filteredReviews = reviews.filter(
        (review) =>
            review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.product_bought?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.review?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.status?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
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
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Review</th>
                                    <th>Rating</th>
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
                                                    onClick={() => handleReplyClick(review)}
                                                />
                                                <Edit2
                                                    className="action-img"
                                                    size={16}
                                                    onClick={() => console.log('Edit review')}
                                                />
                                                <Archive
                                                    className="action-img"
                                                    size={16}
                                                    onClick={() => console.log('Archive review')}
                                                />
                                            </td>
                                            <td>{review.customer_name}</td>
                                            <td>{review.product_bought}</td>
                                            <td>{review.review}</td>
                                            <td>{review.rating}/5</td>
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
                    )}
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
            
            {/* Reply Modal */}
            {selectedReview && (
                <div className="reviews-modal-overlay">
                    <div className="reviews-modal">
                        <h2>Reply to Review</h2>
                        <div className="reviews-modal-content">
                            <div className="reviews-form-group">
                                <label>Customer Review:</label>
                                <div className="reviews-readonly-content">
                                    {selectedReview.review}
                                </div>
                            </div>
                            <div className="reviews-form-group">
                                <label>Your Reply:</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="reviews-reply-input"
                                    rows="4"
                                    placeholder="Type your reply to the customer..."
                                />
                            </div>
                            <div className="reviews-form-buttons">
                                <button type="button" className="reviews-close-btn" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="button" className="reviews-submit-reply-btn" onClick={handleSaveReply}>
                                    Save Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;