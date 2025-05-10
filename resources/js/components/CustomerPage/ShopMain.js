import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Star, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Notifs/CartContext';
import { useWishlist } from '../Notifs/WishlistContext';
import CartModal from '../Notifs/CartModal';
import CartSidebar from '../Notifs/CartSidebar';

const ShopMain = ({ activeFilters }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState({});
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  // API endpoints
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Memoize the filter application logic
  const applyFilters = useCallback(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Filter by categories
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.categories || !Array.isArray(product.categories)) return false;
        const filterIds = activeFilters.categories.map(id => Number(id));
        const productCatIds = product.categories.map(id => Number(id));
        return productCatIds.some(catId => filterIds.includes(catId));
      });
    }

    // Filter by types
    if (activeFilters.types.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.types || !Array.isArray(product.types)) return false;
        const filterIds = activeFilters.types.map(id => Number(id));
        const productTypeIds = product.types.map(id => Number(id));
        return productTypeIds.some(typeId => filterIds.includes(typeId));
      });
    }

    // Filter by brands
    if (activeFilters.brands.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.brand_id) return false;
        const productBrandId = Number(product.brand_id);
        const filterIds = activeFilters.brands.map(id => Number(id));
        return filterIds.includes(productBrandId);
      });
    }

    // Filter by sizes
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        return product.sizes.some(size =>
          typeof size === 'object'
            ? activeFilters.sizes.includes(size.id)
            : activeFilters.sizes.includes(size)
        );
      });
    }

    // Filter by colors
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        return product.colors.some(color =>
          typeof color === 'object'
            ? activeFilters.colors.includes(color.id)
            : activeFilters.colors.includes(color)
        );
      });
    }

    // Filter by price range
    if (activeFilters.priceRange) {
      filtered = filtered.filter(product => {
        const price = Number(product.price);
        return price >= activeFilters.priceRange.min && price <= activeFilters.priceRange.max;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, activeFilters]);

  // Apply filters when activeFilters or products change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Memoize the search handler
  const handleSearch = useCallback((e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply all active filters
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.categories || !Array.isArray(product.categories)) return false;
        const filterIds = activeFilters.categories.map(id => Number(id));
        const productCatIds = product.categories.map(id => Number(id));
        return productCatIds.some(catId => filterIds.includes(catId));
      });
    }

    // Apply other filters...
    // (rest of the filter logic remains the same)

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, activeFilters]);

  // Memoize the sort handler
  const handleSortChange = useCallback((e) => {
    const sortMethod = e.target.value;
    const productsCopy = [...filteredProducts];

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

    setFilteredProducts(productsCopy);
    setCurrentPage(1);
  }, [filteredProducts]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    return {
      currentProducts,
      totalPages,
      indexOfFirstProduct,
      indexOfLastProduct
    };
  }, [currentPage, filteredProducts, productsPerPage]);

  // Memoize pagination handlers
  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);
  const nextPage = useCallback(() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages)), [paginationData.totalPages]);
  const prevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log("=== Raw API data (first 3 products) ===");
      console.log(data.slice(0, 3));

      const processedProducts = data.map((product, index) => {
        // Log brand data for debugging
        console.log(`\nProcessing product ${product.id || index}:`);
        console.log('Raw brand data:', product.brand_id);
        
        // Normalize category_id to categories array
        let normalizedCategories = [];
        console.log(`Processing product ${product.id || index}: category_id raw data:`, product.category_id);
        if (product.category_id) {
          const id = typeof product.category_id === 'string' ? parseInt(product.category_id.trim()) : product.category_id;
          if (!isNaN(id)) {
            normalizedCategories = [id];
          } else {
            console.warn(`Invalid category_id for product ${product.id || index}:`, product.category_id);
          }
        } else {
          console.log(`Product ${product.id || index} has no category_id`);
        }
        console.log(`Product ${product.id || index} normalized categories:`, normalizedCategories);

        // Normalize product_type_id to types array
        let normalizedTypes = [];
        console.log(`Processing product ${product.id || index}: product_type_id raw data:`, product.product_type_id);
        if (product.product_type_id) {
          const id = typeof product.product_type_id === 'string' ? parseInt(product.product_type_id.trim()) : product.product_type_id;
          if (!isNaN(id)) {
            normalizedTypes = [id];
          } else {
            console.warn(`Invalid product_type_id for product ${product.id || index}:`, product.product_type_id);
          }
        } else {
          console.log(`Product ${product.id || index} has no product_type_id`);
        }
        console.log(`Product ${product.id || index} normalized types:`, normalizedTypes);

        // Process brand_id
        let brandId = null;
        if (product.brand_id) {
          brandId = typeof product.brand_id === 'string' ? parseInt(product.brand_id.trim()) : product.brand_id;
          if (isNaN(brandId)) {
            console.warn(`Invalid brand_id for product ${product.id || index}:`, product.brand_id);
            brandId = null;
          }
        }
        console.log(`Product ${product.id || index} processed brand_id:`, brandId);

        return {
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
          brand_id: brandId,
          categories: normalizedCategories,
          types: normalizedTypes,
          sizes: product.sizes
            ? typeof product.sizes === 'string'
              ? product.sizes.split(',').map(s => s.trim())
              : Array.isArray(product.sizes)
              ? product.sizes
              : []
            : [],
          colors: product.colors
            ? typeof product.colors === 'string'
              ? product.colors.split(',').map(c => c.trim())
              : Array.isArray(product.colors)
              ? product.colors
              : []
            : [],
        };
      });

      console.log("=== Processed products (first 3) ===");
      console.log(processedProducts.slice(0, 3));

      const sortedProducts = processedProducts.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
      
      // Fetch review statistics for each product
      sortedProducts.forEach(product => {
        fetchProductReviews(product.id);
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('Failed to load products.');
      setLoading(false);
    }
  };
  
  // Fetch reviews for a product and update review stats
  const fetchProductReviews = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const reviewsData = await response.json();
      
      // Calculate review statistics
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const average = total / reviewsData.length;
        
        setReviewStats(prevStats => ({
          ...prevStats,
          [productId]: {
            count: reviewsData.length,
            average: Number(average.toFixed(1))
          }
        }));
      } else {
        // No reviews for this product
        setReviewStats(prevStats => ({
          ...prevStats,
          [productId]: { count: 0, average: 0 }
        }));
      }
    } catch (err) {
      console.error(`Error fetching reviews for product ${productId}:`, err);
      // Set empty stats on error
      setReviewStats(prevStats => ({
        ...prevStats,
        [productId]: { count: 0, average: 0 }
      }));
    }
  };

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
    navigate(`/product/${productId}`);
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

  if (loading) return <section className="shop-main shop-main--no-sidebar"><p>Loading products...</p></section>;
  if (error) return <section className="shop-main shop-main--no-sidebar"><p>{error}</p></section>;

  return (
    <>
      <section className="shop-main shop-main--no-sidebar">
        <div className="shop-main__header">
          <div className="shop-main__controls-left">
            {/* Filters button removed */}
          </div>
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
    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
  </h2>
</div>

        <div className="shop-main__products">
          {paginationData.currentProducts.length > 0 ? paginationData.currentProducts.map((product) => (
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
                    fill={index < (reviewStats[product.id]?.average || 0) ? '#FFD700' : 'none'}
                    stroke={index < (reviewStats[product.id]?.average || 0) ? '#FFD700' : '#ccc'}
                  />
                ))}
                <span className="shop-main__rating-count">
                  ({reviewStats[product.id]?.count || 0})
                </span>
              </div>
            </div>
          )) : (
            <p className="shop-main__no-products">No products found. Try adjusting your filters or search criteria.</p>
          )}
        </div>

        {filteredProducts.length > productsPerPage && (
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

              {Array.from({ length: paginationData.totalPages })
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

              {currentPage < paginationData.totalPages - 2 && (
                <>
                  {currentPage < paginationData.totalPages - 3 && (
                    <span className="shop-main__pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`shop-main__pagination-number ${paginationData.totalPages === currentPage ? 'active' : ''}`}
                    onClick={() => paginate(paginationData.totalPages)}
                  >
                    {paginationData.totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              className="shop-main__pagination-button"
              onClick={nextPage}
              disabled={currentPage === paginationData.totalPages}
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