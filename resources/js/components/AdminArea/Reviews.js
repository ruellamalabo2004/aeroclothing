import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    reply: ""
  });
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
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
          status: review.status || "Active"
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

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setEditFormData({
      reply: review.reply || ""
    });
    setIsEditing(true);
  };

  const handleArchiveReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to archive this review?")) {
      const token = localStorage.getItem('token');
      try {
        await axios.patch(
          `${API_URL}/reviews/${reviewId}/archive`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update the reviews list to remove the archived review
        setReviews(prevReviews => prevReviews.map(review => 
          review.id === reviewId ? { ...review, status: "Archived" } : review
        ));
        setError(null);
      } catch (error) {
        console.error("Error archiving review:", error.response?.data || error.message);
        setError("Failed to archive review. Please try again later.");
      }
    }
  };

  const handleRevertReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to restore this review?")) {
      const token = localStorage.getItem('token');
      try {
        await axios.patch(
          `${API_URL}/reviews/${reviewId}/restore`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update the reviews list to restore the review
        setReviews(prevReviews => prevReviews.map(review => 
          review.id === reviewId ? { ...review, status: "Active" } : review
        ));
        setError(null);
      } catch (error) {
        console.error("Error restoring review:", error.response?.data || error.message);
        setError("Failed to restore review. Please try again later.");
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    const token = localStorage.getItem('token');
    try {
      // Add or update the reply
      if (editFormData.reply.trim()) {
        await axios.post(
          `${API_URL}/reviews/${selectedReview.id}/reply`,
          { reply: editFormData.reply },
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
      }

      // Update the reviews list with the reply
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === selectedReview.id
            ? { 
                ...review, 
                reply: editFormData.reply
              }
            : review
        )
      );
      
      setSelectedReview(null);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error("Error updating review reply:", error.response?.data || error.message);
      setError("Failed to update reply. Please try again later.");
    }
  };

  const handleCancelEdit = () => {
    setSelectedReview(null);
    setIsEditing(false);
  };

  // Filter reviews based on active tab and search term
  const filteredReviews = reviews.filter((review) => {
    const matchesTab =
      activeTab === "All" ||
      review.status === (activeTab === "Archived" ? "Archived" : "Active");
    const matchesSearch =
      review.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_bought?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main>
      <h1>Reviews</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="reviews-links">
        <span className="reviews-label">Reviews:</span>
        <div className="links-container">
          <a
            href="#"
            className={activeTab === "All" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("All");
            }}
          >
            All
          </a>
          <a
            href="#"
            className={activeTab === "Archived" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("Archived");
            }}
          >
            Archived
          </a>
        </div>
        <input
          type="text"
          placeholder="Search reviews by customer, product, or content..."
          className="reviews-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <img
                      src="/imgs/viewing.svg"
                      alt="View"
                      className="action-img"
                      onClick={() => setSelectedReview(review)}
                    />
                    <img
                      src="/imgs/editing.svg"
                      alt="Edit"
                      className="action-img"
                      onClick={() => handleEditReview(review)}
                    />
                    {review.status === "Archived" ? (
                      <img
                        src="/imgs/revert.svg"
                        alt="Revert"
                        className="action-img"
                        onClick={() => handleRevertReview(review.id)}
                      />
                    ) : (
                      <img
                        src="/imgs/archiving.svg"
                        alt="Archive"
                        className="action-img"
                        onClick={() => handleArchiveReview(review.id)}
                      />
                    )}
                  </td>
                  <td>{review.customer}</td>
                  <td>{review.product_bought}</td>
                  <td>{review.review}</td>
                  <td>{review.rate}/5</td>
                  <td>{review.date}</td>
                  <td>
                    <span
                      className={`status-frame status-${review.status?.toLowerCase() || "unknown"}`}
                    >
                      {review.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No reviews available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing and replying to a review */}
      {selectedReview && (
        <div className="reviews-modal-overlay">
          <div className="reviews-modal">
            <h2>{isEditing ? "Reply to Review" : "Review Details"}</h2>
            <div className="reviews-modal-content">
              {isEditing ? (
                <form onSubmit={handleSaveEdit}>
                  <div className="reviews-form-group">
                    <label>Customer Review:</label>
                    <div className="reviews-readonly-content">
                      {selectedReview.review}
                    </div>
                  </div>
                  <div className="reviews-form-group">
                    <label>Your Reply:</label>
                    <textarea
                      value={editFormData.reply}
                      onChange={(e) => setEditFormData({...editFormData, reply: e.target.value})}
                      className="reviews-reply-input"
                      rows="4"
                      placeholder="Type your reply to the customer..."
                    />
                  </div>
                  <div className="reviews-form-buttons">
                    <button type="button" className="reviews-close-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                    <button type="submit" className="reviews-submit-reply-btn">
                      Save Reply
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p><strong>Customer:</strong> {selectedReview.customer}</p>
                  <p><strong>Product Bought:</strong> {selectedReview.product_bought}</p>
                  <p><strong>Review:</strong> {selectedReview.review}</p>
                  <p><strong>Rating:</strong> {selectedReview.rate}/5</p>
                  <p><strong>Date:</strong> {selectedReview.date}</p>
                  {selectedReview.reply && (
                    <p><strong>Reply:</strong> {selectedReview.reply}</p>
                  )}
                </>
              )}
            </div>
            {!isEditing && (
              <button
                className="reviews-close-btn"
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText("");
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}