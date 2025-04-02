import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000/api";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Map the API response to match the frontend structure
        const formattedReviews = response.data.map(review => ({
          id: review.id,
          customer: review.user?.name || "Unknown Customer", // Adjust based on user relation
          product_bought: review.product?.product_name || "Unknown Product",
          review: review.review || "No review provided",
          rate: review.rating || 0,
          date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : "N/A",
          reply: review.reply || null,
        }));
        setReviews(formattedReviews);
        setError(null);
      } catch (error) {
        console.error("Error fetching reviews:", error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError("Failed to fetch reviews. Please try again later.");
        }
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API_URL}/reviews/${selectedReview.id}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      const updatedReview = { ...selectedReview, reply: response.data.reply || replyText };
      setReviews((prev) =>
        prev.map((review) =>
          review.id === selectedReview.id ? updatedReview : review
        )
      );
      setSelectedReview(updatedReview);
      setReplyText("");
      setError(null);
    } catch (error) {
      console.error("Error submitting reply:", error.response?.data || error.message);
      setError("Failed to submit reply. Please try again later.");
    }
  };

  return (
    <main>
      <h1>Reviews</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="reviews-table-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Customer</th>
              <th>Product Bought</th>
              <th>Review</th>
              <th>Rate</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <img
                      src="/imgs/view.svg"
                      alt="View"
                      className="action-img"
                      onClick={() => setSelectedReview(review)}
                    />
                  </td>
                  <td>{review.customer}</td>
                  <td>{review.product_bought}</td>
                  <td>{review.review}</td>
                  <td>{review.rate}/5</td>
                  <td>{review.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No reviews available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing and replying to a review */}
      {selectedReview && (
        <div className="reviews-modal-overlay">
          <div className="reviews-modal">
            <h2>Review Details</h2>
            <div className="reviews-modal-content">
              <p><strong>Customer:</strong> {selectedReview.customer}</p>
              <p><strong>Product Bought:</strong> {selectedReview.product_bought}</p>
              <p><strong>Review:</strong> {selectedReview.review}</p>
              <p><strong>Rating:</strong> {selectedReview.rate}/5</p>
              <p><strong>Date:</strong> {selectedReview.date}</p>
              {selectedReview.reply && (
                <p><strong>Reply:</strong> {selectedReview.reply}</p>
              )}
              {!selectedReview.reply && (
                <form className="reviews-reply-form" onSubmit={handleReplySubmit}>
                  <label>Reply:</label>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="reviews-reply-input"
                  />
                  <button type="submit" className="reviews-submit-reply-btn">
                    Send
                  </button>
                </form>
              )}
            </div>
            <button
              className="reviews-close-btn"
              onClick={() => {
                setSelectedReview(null);
                setReplyText("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}