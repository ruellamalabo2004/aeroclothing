import React, { useState, useEffect } from "react";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews from API (using dummy data for now)
  useEffect(() => {
    const dummyReviews = [
      {
        id: 1,
        customer: "John Doe",
        product_bought: "Smartphone X",
        review: "Great product, fast shipping!",
        rate: 4,
        date: "2023-10-01",
        reply: null,
      },
      {
        id: 2,
        customer: "Jane Smith",
        product_bought: "Laptop Pro",
        review: "Good, but could improve packaging.",
        rate: 3,
        date: "2023-10-02",
        reply: "Thanks for the feedback! We’ll work on it.",
      },
    ];
    setReviews(dummyReviews);

    // Uncomment to fetch from API
    /*
    fetch("http://127.0.0.1:8000/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((error) => console.error("Error fetching reviews:", error));
    */
  }, []);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;

    // Update local state (replace with API call)
    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id ? { ...review, reply: replyText } : review
      )
    );
    setSelectedReview({ ...selectedReview, reply: replyText });
    setReplyText("");

    // Uncomment to send reply to API
    /*
    fetch(`http://127.0.0.1:8000/api/reviews/${selectedReview.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews((prev) =>
          prev.map((review) =>
            review.id === selectedReview.id ? { ...review, reply: data.reply } : review
          )
        );
      })
      .catch((error) => console.error("Error submitting reply:", error));
    */
  };

  return (
    <main>
      <h1>Reviews</h1>
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
            {reviews.map((review) => (
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
            ))}
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