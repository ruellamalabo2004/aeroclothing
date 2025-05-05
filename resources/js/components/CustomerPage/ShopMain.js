import React, { useState, useEffect } from 'react';
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

  // Apply filters when activeFilters or products change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [activeFilters, products]);

  const applyFilters = () => {
    console.log("=== Applying filters ===");
    console.log("Active filters:", activeFilters);
    console.log("Total products before filtering:", products.length);

    let filtered = [...products];

    // Filter by categories
    if (activeFilters.categories.length > 0) {
      console.log("Selected category IDs:", activeFilters.categories);
      filtered = filtered.filter(product => {
        if (!product.categories || !Array.isArray(product.categories)) {
          console.log(`Product ${product.id} has no valid categories:`, product.categories);
          return false;
        }
        const filterIds = activeFilters.categories.map(id => Number(id));
        const productCatIds = product.categories.map(id => Number(id));
        const matchFound = productCatIds.some(catId => {
          const included = filterIds.includes(catId);
          console.log(
            `Product ${product.id}: Checking category ID ${catId} against filter IDs ${filterIds} -> Match: ${included}`
          );
          return included;
        });
        console.log(`Product ${product.id} category match result: ${matchFound}`);
        return matchFound;
      });
      console.log("Products after category filtering:", filtered.length);
    } else {
      console.log("No category filters applied, skipping category filtering");
    }

    // Filter by types
    if (activeFilters.types.length > 0) {
      console.log("Selected type IDs:", activeFilters.types);
      filtered = filtered.filter(product => {
        if (!product.types || !Array.isArray(product.types)) {
          console.log(`Product ${product.id} has no valid types:`, product.types);
          return false;
        }
        const filterIds = activeFilters.types.map(id => Number(id));
        const productTypeIds = product.types.map(id => Number(id));
        const matchFound = productTypeIds.some(typeId => {
          const included = filterIds.includes(typeId);
          console.log(
            `Product ${product.id}: Checking type ID ${typeId} against filter IDs ${filterIds} -> Match: ${included}`
          );
          return included;
        });
        console.log(`Product ${product.id} type match result: ${matchFound}`);
        return matchFound;
      });
      console.log("Products after type filtering:", filtered.length);
    } else {
      console.log("No type filters applied, skipping type filtering");
    }

    // Filter by sizes
    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) {
          console.log(`Product ${product.id} has no valid sizes:`, product.sizes);
          return false;
        }
        const match = product.sizes.some(size =>
          typeof size === 'object'
            ? activeFilters.sizes.includes(size.id)
            : activeFilters.sizes.includes(size)
        );
        console.log(`Product ${product.id} size match result: ${match}`);
        return match;
      });
      console.log("Products after size filtering:", filtered.length);
    }

    // Filter by colors
    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.colors || !Array.isArray(product.colors)) {
          console.log(`Product ${product.id} has no valid colors:`, product.colors);
          return false;
        }
        const match = product.colors.some(color =>
          typeof color === 'object'
            ? activeFilters.colors.includes(color.id)
            : activeFilters.colors.includes(color)
        );
        console.log(`Product ${product.id} color match result: ${match}`);
        return match;
      });
      console.log("Products after color filtering:", filtered.length);
    }

    // Filter by price range
    if (activeFilters.priceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const match = activeFilters.priceRanges.some(range => {
          if (range === 'Under $50') {
            return product.price < 50;
          } else if (range === '$50 – $100') {
            return product.price >= 50 && product.price <= 100;
          } else if (range === '$100 – $200') {
            return product.price > 100 && product.price <= 200;
          } else if (range === '$200+') {
            return product.price > 200;
          }
          return false;
        });
        console.log(`Product ${product.id} price match result: ${match}`);
        return match;
      });
      console.log("Products after price filtering:", filtered.length);
    }

    console.log("Final filtered products count:", filtered.length);
    setFilteredProducts(filtered);
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
      console.log("=== Raw API data (first 3 products) ===");
      console.log(data.slice(0, 3));

      const processedProducts = data.map((product, index) => {
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('Failed to load products.');
      setLoading(false);
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

  const handleSortChange = (e) => {
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
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    console.log("=== Handling search ===");
    console.log("Search term:", searchTerm);

    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(searchTerm)
      );
      console.log("Products after search filtering:", filtered.length);
    }

    if (activeFilters.categories.length > 0) {
      console.log("Applying category filters during search:", activeFilters.categories);
      filtered = filtered.filter(product => {
        if (!product.categories || !Array.isArray(product.categories)) {
          console.log(`Product ${product.id} has no valid categories:`, product.categories);
          return false;
        }
        const filterIds = activeFilters.categories.map(id => Number(id));
        const productCatIds = product.categories.map(id => Number(id));
        const match = productCatIds.some(catId => filterIds.includes(catId));
        console.log(`Product ${product.id} category match result: ${match}`);
        return match;
      });
      console.log("Products after category filtering (search):", filtered.length);
    }

    if (activeFilters.types.length > 0) {
      console.log("Applying type filters during search:", activeFilters.types);
      filtered = filtered.filter(product => {
        if (!product.types || !Array.isArray(product.types)) {
          console.log(`Product ${product.id} has no valid types:`, product.types);
          return false;
        }
        const filterIds = activeFilters.types.map(id => Number(id));
        const productTypeIds = product.types.map(id => Number(id));
        const match = productTypeIds.some(typeId => filterIds.includes(typeId));
        console.log(`Product ${product.id} type match result: ${match}`);
        return match;
      });
      console.log("Products after type filtering (search):", filtered.length);
    }

    if (activeFilters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) {
          return false;
        }
        const match = product.sizes.some(size =>
          typeof size === 'object'
            ? activeFilters.sizes.includes(size.id)
            : activeFilters.sizes.includes(size)
        );
        console.log(`Product ${product.id} size match result: ${match}`);
        return match;
      });
      console.log("Products after size filtering (search):", filtered.length);
    }

    if (activeFilters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.colors || !Array.isArray(product.colors)) {
          return false;
        }
        const match = product.colors.some(color =>
          typeof color === 'object'
            ? activeFilters.colors.includes(color.id)
            : activeFilters.colors.includes(color)
        );
        console.log(`Product ${product.id} color match result: ${match}`);
        return match;
      });
      console.log("Products after color filtering (search):", filtered.length);
    }

    if (activeFilters.priceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const match = activeFilters.priceRanges.some(range => {
          if (range === 'Under $50') {
            return product.price < 50;
          } else if (range === '$50 – $100') {
            return product.price >= 50 && product.price <= 100;
          } else if (range === '$100 – $200') {
            return product.price > 100 && product.price <= 200;
          } else if (range === '$200+') {
            return product.price > 200;
          }
          return false;
        });
        console.log(`Product ${product.id} price match result: ${match}`);
        return match;
      });
      console.log("Products after price filtering (search):", filtered.length);
    }

    console.log("Final search filtered products count:", filtered.length);
    setFilteredProducts(filtered);
    setCurrentPage(1);
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
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

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

              {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) })
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

              {currentPage < Math.ceil(filteredProducts.length / productsPerPage) - 2 && (
                <>
                  {currentPage < Math.ceil(filteredProducts.length / productsPerPage) - 3 && (
                    <span className="shop-main__pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`shop-main__pagination-number ${Math.ceil(filteredProducts.length / productsPerPage) === currentPage ? 'active' : ''}`}
                    onClick={() => paginate(Math.ceil(filteredProducts.length / productsPerPage))}
                  >
                    {Math.ceil(filteredProducts.length / productsPerPage)}
                  </button>
                </>
              )}
            </div>

            <button
              className="shop-main__pagination-button"
              onClick={nextPage}
              disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
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