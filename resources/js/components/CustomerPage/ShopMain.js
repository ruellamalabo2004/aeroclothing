import React, { useState, useEffect } from 'react';
import { Search, Star, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Notifs/CartContext'; // Adjust import path as needed
import { useWishlist } from '../Notifs/WishlistContext'; // Adjust import path as needed

const ShopMain = ({ toggleFilters }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  // API endpoints
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    // Fetch all products from the backend
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Process and format the products data
        const processedProducts = data.map((product) => ({
          id: product.id ?? `${Date.now()}-${Math.random()}`,
          created_at: product.created_at ?? new Date().toISOString(),
          imagePreview: product.image_1
            ? `${BASE_IMAGE_URL}/${product.image_1}`
            : "/images/placeholder.png",
          imageHover: product.image_2
            ? `${BASE_IMAGE_URL}/${product.image_2}`
            : product.image_1
            ? `${BASE_IMAGE_URL}/${product.image_1}`
            : "/images/placeholder.png",
          productName: product.product_name ?? "Unnamed Product",
          price: Number(product.price) || 0,
          rating: product.rating || 0,
          sizes: product.sizes
            ? typeof product.sizes === 'string'
              ? product.sizes.split(',').map((s) => s.trim())
              : Array.isArray(product.sizes)
              ? product.sizes
              : []
            : [],
          colors: product.colors
            ? typeof product.colors === 'string'
              ? product.colors.split(',').map((c) => c.trim())
              : Array.isArray(product.colors)
              ? product.colors
              : []
            : [],
        }));

        // Sort products by created_at date, newest first
        const sortedProducts = processedProducts.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setProducts(sortedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError('Failed to load products.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleWishlistToggle = (product) => (e) => {
    e.stopPropagation();
    const productId = parseInt(product.id);
    if (wishlistLoading[productId]) return;

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const isInWishlist = wishlist.some((item) => item.id === productId);
      if (isInWishlist) {
        removeFromWishlist(productId);
      } else {
        addToWishlist({
          id: productId,
          productName: product.productName,
          price: product.price,
          imagePreview: product.imagePreview,
        });
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (product) => (e) => {
    e.stopPropagation();
    // Add the product to cart
    addToCart({
      id: product.id,
      name: product.productName,
      price: product.price,
      image: product.imagePreview,
      quantity: 1,
    });
  };

  const handleProductClick = (productId) => () => {
    navigate(`/shop/${productId}`);
  };

  const handleSortChange = (e) => {
    const sortMethod = e.target.value;
    const productsCopy = [...products];
    
    switch (sortMethod) {
      case 'newest':
        productsCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price-low':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    
    setProducts(productsCopy);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm.trim()) {
      // If search is cleared, fetch all products again
      fetchProducts();
      return;
    }
    
    // Filter products based on search term
    const filteredProducts = products.filter(product => 
      product.productName.toLowerCase().includes(searchTerm)
    );
    
    setProducts(filteredProducts);
  };
  
  // Function to re-fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      const processedProducts = data.map((product) => ({
        id: product.id ?? `${Date.now()}-${Math.random()}`,
        created_at: product.created_at ?? new Date().toISOString(),
        imagePreview: product.image_1
          ? `${BASE_IMAGE_URL}/${product.image_1}`
          : "/images/placeholder.png",
        imageHover: product.image_2
          ? `${BASE_IMAGE_URL}/${product.image_2}`
          : product.image_1
          ? `${BASE_IMAGE_URL}/${product.image_1}`
          : "/images/placeholder.png",
        productName: product.product_name ?? "Unnamed Product",
        price: Number(product.price) || 0,
        rating: product.rating || 0,
        sizes: product.sizes
          ? typeof product.sizes === 'string'
            ? product.sizes.split(',').map((s) => s.trim())
            : Array.isArray(product.sizes)
            ? product.sizes
            : []
          : [],
        colors: product.colors
          ? typeof product.colors === 'string'
            ? product.colors.split(',').map((c) => c.trim())
            : Array.isArray(product.colors)
            ? product.colors
            : []
          : [],
      }));

      // Sort products by created_at date, newest first
      const sortedProducts = processedProducts.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setProducts(sortedProducts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('Failed to load products.');
      setLoading(false);
    }
  };

  if (loading) return <section className="shop-main"><p>Loading products...</p></section>;
  if (error) return <section className="shop-main"><p>{error}</p></section>;

  return (
    <section className="shop-main">
      <div className="shop-main__header">
        <div className="shop-main__search-container">
          <Search size={20} className="shop-main__search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="shop-main__search-input"
            onChange={handleSearch}
          />
        </div>
        <div className="shop-main__sort-container">
          <select 
            className="shop-main__sort"
            onChange={handleSortChange}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="shop-main__products">
        {products.length > 0 ? products.map((product) => (
          <div key={product.id} className="shop-main__product" onClick={handleProductClick(product.id)}>
            <div className="shop-main__image-container">
              <img
                src={product.imagePreview}
                alt={product.productName}
                className="shop-main__image shop-main__image-main"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
              <img
                src={product.imageHover}
                alt={`${product.productName} alternative view`}
                className="shop-main__image shop-main__image-hover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = product.imagePreview || "/images/placeholder.png";
                }}
              />
              <div className="shop-main__buttons">
                <button
                  className={`shop-main__wishlist ${wishlist.some((item) => item.id === parseInt(product.id)) ? 'active' : ''}`}
                  onClick={handleWishlistToggle(product)}
                  aria-label={wishlist.some((item) => item.id === parseInt(product.id)) ? 'Remove from wishlist' : 'Add to wishlist'}
                  disabled={wishlistLoading[product.id]}
                >
                  <Heart
                    size={20}
                    fill={wishlist.some((item) => item.id === parseInt(product.id)) ? 'currentColor' : 'none'}
                  />
                </button>
                <button
                  className="shop-main__add-to-cart"
                  onClick={handleAddToCart(product)}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
            <h3 className="shop-main__name">{product.productName}</h3>
            <div className="shop-main__rating">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  fill={index < product.rating ? '#FFD700' : 'none'}
                  stroke={index < product.rating ? '#FFD700' : '#ccc'}
                />
              ))}
            </div>
            <p className="shop-main__price">${product.price.toFixed(2)}</p>
          </div>
        )) : (
          <p>No products found. Try adjusting your search criteria.</p>
        )}
      </div>
    </section>
  );
};

export default ShopMain;