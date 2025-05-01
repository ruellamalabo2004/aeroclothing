import React, { useState, useEffect } from 'react';
import { Search, Star, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Notifs/CartContext';
import { useWishlist } from '../Notifs/WishlistContext';
import CartModal from '../Notifs/CartModal';
import CartSidebar from '../Notifs/CartSidebar';

const ShopMain = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  // API endpoints
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
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
    setSelectedProduct(product);
  };

  const handleProductClick = (productId) => () => {
    navigate(`/product/${productId}`); // Updated to navigate to /product/:productId
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
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();

    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }

    const filteredProducts = products.filter((product) =>
      product.productName.toLowerCase().includes(searchTerm)
    );

    setProducts(filteredProducts);
    setCurrentPage(1);
  };

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

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCartConfirmed = (cartItem) => {
    addToCart(cartItem);
    setIsCartOpen(true);
  };

  const toggleCartSidebar = () => {
    setIsCartOpen((prev) => !prev);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(products.length / productsPerPage)));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) return <section className="shop-main"><p>Loading products...</p></section>;
  if (error) return <section className="shop-main"><p>{error}</p></section>;

  return (
    <>
      <section className="shop-main">
        <div className="shop-main__header">
          <div className="shop-main__controls-right">
            <div className="shop-main__search-container">
              <Search size={18} className="shop-main__search-icon" />
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
        </div>

        <div className="shop-main__products-header">
          <h2 className="shop-main__products-count">
            {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
          </h2>
        </div>

        <div className="shop-main__products">
          {currentProducts.length > 0 ? currentProducts.map((product) => (
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
              <p className="shop-main__price">${product.price.toFixed(2)}</p>
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
            </div>
          )) : (
            <p>No products found. Try adjusting your search criteria.</p>
          )}
        </div>

        {products.length > productsPerPage && (
          <div className="shop-main__pagination">
            <button
              className="shop-main__pagination-button"
              onClick={prevPage}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="shop-main__pagination-numbers">
              {currentPage > 3 && (
                <>
                  <button
                    className={`shop-main__pagination-number ${1 === currentPage ? 'active' : ''}`}
                    onClick={() => paginate(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="shop-main__pagination-ellipsis">...</span>}
                </>
              )}

              {Array.from({ length: Math.ceil(products.length / productsPerPage) })
                .map((_, i) => {
                  const pageNumber = i + 1;
                  if (pageNumber === currentPage - 1 || pageNumber === currentPage || pageNumber === currentPage + 1) {
                    return (
                      <button
                        key={pageNumber}
                        className={`shop-main__pagination-number ${pageNumber === currentPage ? 'active' : ''}`}
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}

              {currentPage < Math.ceil(products.length / productsPerPage) - 2 && (
                <>
                  {currentPage < Math.ceil(products.length / productsPerPage) - 3 && (
                    <span className="shop-main__pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`shop-main__pagination-number ${Math.ceil(products.length / productsPerPage) === currentPage ? 'active' : ''}`}
                    onClick={() => paginate(Math.ceil(products.length / productsPerPage))}
                  >
                    {Math.ceil(products.length / productsPerPage)}
                  </button>
                </>
              )}
            </div>

            <button
              className="shop-main__pagination-button"
              onClick={nextPage}
              disabled={currentPage === Math.ceil(products.length / productsPerPage)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {selectedProduct && (
        <CartModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartConfirmed}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default ShopMain;