import React from 'react';
import { Trash2 } from 'lucide-react';
import { useWishlist } from './WishlistContext';
import { Link } from 'react-router-dom';


const WishlistNotif = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();

  if (!isOpen) return null;

  const displayedItems = wishlist.slice(0, 4);
  const remainingItems = wishlist.length - displayedItems.length;

  const handleRemove = (itemId) => async (e) => {
    e.stopPropagation();
    await removeFromWishlist(itemId);
  };

  return (
    <div className="wishlist-notif">
      <div className="wishlist-notif__header">
        <h3>My Wishlist ({wishlist.length})</h3>
      </div>
      {isLoading ? (
        <div className="wishlist-notif__loading">Loading...</div>
      ) : wishlist.length === 0 ? (
        <div className="wishlist-notif__empty">Your wishlist is empty.</div>
      ) : (
        <>
          <div className="wishlist-notif__items">
            {displayedItems.map((item) => (
              <div key={item.id} className="wishlist-notif__item">
                <img
                  src={item.imagePreview}
                  alt={item.productName}
                  className="wishlist-notif__image"
                  onError={(e) => (e.target.src = '/images/placeholder.png')}
                />
                <div className="wishlist-notif__details">
                  <h4 className="wishlist-notif__name">{item.productName}</h4>
                  <p className="wishlist-notif__price">${item.price.toFixed(2)}</p>
                </div>
                <button
                  className="wishlist-notif__remove"
                  onClick={handleRemove(item.id)}
                  aria-label={`Remove ${item.productName} from wishlist`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {remainingItems > 0 && (
            <Link
              to="/wishlist"
              className="wishlist-notif__see-more"
              onClick={onClose}
            >
              See More ({remainingItems} more items)
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default WishlistNotif;