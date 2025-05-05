import React from 'react';
import { useWishlist } from '../Notifs/WishlistContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';

const ProfileWishlist = () => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();

  const handleRemove = (itemId) => async (e) => {
    e.stopPropagation();
    await removeFromWishlist(itemId);
  };

  const handleAddToCart = (itemId) => {
    console.log(`Added item ${itemId} to cart`);
    // Add to cart logic would go here
  };

  return (
    <div className="profile-wishlist">
      <div className="profile-wishlist-section">
        <div className="profile-wishlist-header">
          <h2 className="profile-wishlist-title">My Wishlist</h2>
          <span className="profile-wishlist-item-count">{wishlist.length} items</span>
        </div>
        {isLoading ? (
          <p className="profile-wishlist-loading">Loading...</p>
        ) : wishlist.length === 0 ? (
          <p className="profile-wishlist-no-items">Your wishlist is empty.</p>
        ) : (
          <div className="profile-wishlist-items">
            {wishlist.map((item) => (
              <div key={item.id} className="profile-wishlist-item">
                <img
                  src={item.imagePreview}
                  alt={item.productName}
                  className="profile-wishlist-item-image"
                  onError={(e) => (e.target.src = '/images/placeholder.png')}
                />
                <div className="profile-wishlist-item-details">
                  <h3 className="profile-wishlist-item-name">{item.productName}</h3>
                  <p className="profile-wishlist-item-price">${item.price.toFixed(2)}</p>
                  <p className="profile-wishlist-item-date">Added on {item.addedDate || 'N/A'}</p>
                  <button
                    className={`profile-wishlist-item-add ${!item.inStock ? 'disabled' : ''}`}
                    onClick={() => item.inStock && handleAddToCart(item.id)}
                    disabled={!item.inStock}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  {!item.inStock && <span className="profile-wishlist-item-out-of-stock">Out of stock</span>}
                  <button
                    className="profile-wishlist-item-remove"
                    onClick={handleRemove(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWishlist;