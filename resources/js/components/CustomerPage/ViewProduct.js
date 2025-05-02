import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useCart } from '../Notifs/CartContext';
import { useWishlist } from '../Notifs/WishlistContext';

// Color mapping helper function - same as in CartModal.js
const getColorHexCode = (colorName) => {
  const colorMap = {
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Black': '#000000',
    'Green': '#008000',
    'Gray': '#808080',
    'White': '#FFFFFF',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Navy': '#000080',
    'Teal': '#008080',
    'Maroon': '#800000',
    'Olive': '#808000',
    'Cyan': '#00FFFF',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Beige': '#F5F5DC',
    'Coral': '#FF7F50',
    'Turquoise': '#40E0D0',
    'Lavender': '#E6E6FA',
    'Indigo': '#4B0082',
  };
  
  // If the color exists in our map, return it, otherwise default to a light gray
  return colorMap[colorName] || '#CCCCCC';
};

const ViewProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // API endpoints
  const API_URL = "http://127.0.0.1:8000/api";
  const BASE_IMAGE_URL = "http://127.0.0.1:8000/storage";

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productResponse = await fetch(`${API_URL}/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Failed to fetch product');
        }
        const productData = await productResponse.json();
        console.log('Product data:', productData); // Debug log

        // Process main image and thumbnail image
        const mainImageUrl = productData.image_1
          ? `${BASE_IMAGE_URL}/${productData.image_1}`
          : "/images/placeholder.png";
        
        const thumbnailImageUrl = productData.image_2
          ? `${BASE_IMAGE_URL}/${productData.image_2}`
          : productData.image_1
          ? `${BASE_IMAGE_URL}/${productData.image_1}`
          : "/images/placeholder.png";
        
        setMainImage(mainImageUrl);
        setThumbnailImage(thumbnailImageUrl);

        // Extract colors from the product data
        if (productData.colors && Array.isArray(productData.colors)) {
          setAvailableColors(productData.colors);
          if (productData.colors.length > 0) {
            setSelectedColor(productData.colors[0].color_name);
          }
          console.log('Product colors:', productData.colors);
        } else {
          console.warn('No colors found in product data');
          setAvailableColors([]);
        }

        // Extract sizes from the product data
        if (productData.sizes && Array.isArray(productData.sizes)) {
          setAvailableSizes(productData.sizes);
          if (productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0].size_name);
          }
          console.log('Product sizes:', productData.sizes);
        } else {
          console.warn('No sizes found in product data');
          setAvailableSizes([]);
        }

        const processedProduct = {
          id: productData.id ?? `${Date.now()}-${Math.random()}`,
          imagePreview: mainImageUrl,
          imageThumbnail: thumbnailImageUrl,
          productName: productData.product_name ?? "Unnamed Product",
          price: Number(productData.price) || 0,
          rating: productData.rating || 0,
          description: productData.description || "No description available.",
          // Store all available images
          images: [
            productData.image_1 ? `${BASE_IMAGE_URL}/${productData.image_1}` : "/images/placeholder.png",
            productData.image_2 ? `${BASE_IMAGE_URL}/${productData.image_2}` : null,
          ].filter(Boolean) // Remove null values
        };

        setProduct(processedProduct);

        // Fetch inventory data
        try {
          const inventoryResponse = await fetch(`${API_URL}/inventories/product/${productId}`);
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            handleInventoryData(inventoryData);
          } else {
            // Fallback methods for fetching inventory
            const allInventoriesResponse = await fetch(`${API_URL}/inventories`);
            if (allInventoriesResponse.ok) {
              const allInventories = await allInventoriesResponse.json();
              const productInventory = Array.isArray(allInventories)
                ? allInventories.find(inv => Number(inv.product_id) === Number(productId))
                : null;
              handleInventoryData(productInventory);
            } else {
              const originalInventoryResponse = await fetch(`${API_URL}/inventories?product_id=${productId}`);
              if (originalInventoryResponse.ok) {
                const originalInventoryData = await originalInventoryResponse.json();
                handleInventoryData(originalInventoryData);
              } else {
                throw new Error('All inventory fetch attempts failed');
              }
            }
          }
        } catch (inventoryError) {
          console.error('Inventory fetch error:', inventoryError);
          setInventory({
            stockQuantity: 0,
            status: 'Unknown Status',
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Product fetch error:', err);
        setError('Failed to load product information.');
        setLoading(false);
      }
    };

    // Helper function to process inventory data
    const handleInventoryData = (data) => {
      let inventoryRecord = null;
      
      if (Array.isArray(data)) {
        inventoryRecord = data.find(inv => Number(inv.product_id) === Number(productId));
        if (!inventoryRecord && data.length > 0) {
          inventoryRecord = data[0];
        }
      } else if (data && typeof data === 'object') {
        inventoryRecord = data;
      }

      if (inventoryRecord) {
        setInventory({
          stockQuantity: inventoryRecord.stock_quantity || 0,
          status: inventoryRecord.status || 'Unknown Status',
        });
      } else {
        setInventory({
          stockQuantity: 0,
          status: 'Out of Stock',
        });
      }
    };

    fetchProductData();
  }, [productId]);

  // Function to swap images when thumbnail is clicked
  const handleThumbnailClick = () => {
    const tempMain = mainImage;
    setMainImage(thumbnailImage);
    setThumbnailImage(tempMain);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (wishlistLoading || !product) return;

    setWishlistLoading(true);
    try {
      const productIdNum = parseInt(product.id);
      const isInWishlist = wishlist.some((item) => item.id === productIdNum);
      if (isInWishlist) {
        removeFromWishlist(productIdNum);
      } else {
        addToWishlist({
          id: productIdNum,
          productName: product.productName,
          price: product.price,
          imagePreview: mainImage, // Use current main image
        });
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product || !inventory || inventory.stockQuantity <= 0) {
      alert('Product is out of stock.');
      return;
    }

    // Validate size and color selection
    if ((availableSizes.length > 0 && !selectedSize) || 
        (availableColors.length > 0 && !selectedColor)) {
      alert('Please select a size and color.');
      return;
    }

    console.log(`Adding to cart with size: ${selectedSize}, color: ${selectedColor}`); // Debug log

    addToCart({
      id: parseInt(product.id),
      productName: product.productName,
      price: product.price,
      imagePreview: mainImage,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity: 1 // Default quantity
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!product || !inventory || inventory.stockQuantity <= 0) {
      alert('Product is out of stock.');
      return;
    }

    // Validate size and color selection
    if ((availableSizes.length > 0 && !selectedSize) || 
        (availableColors.length > 0 && !selectedColor)) {
      alert('Please select a size and color.');
      return;
    }

    // Add to cart
    addToCart({
      id: parseInt(product.id),
      productName: product.productName,
      price: product.price,
      imagePreview: mainImage,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      quantity: 1
    });

    // Navigate to cart/checkout (implement navigation as needed)
    alert('Buy Now: Added to cart and would navigate to checkout.');
  };

  // Parse the description into intro, features, and care instructions
  let intro = product?.description || 'No description available.';
  let features = [];
  let careInstructions = [];

  if (product && product.description && typeof product.description === 'string') {
    // Normalize line breaks
    const normalizedDescription = product.description.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    console.log('Normalized Description:', normalizedDescription); // Debug log

    // Split by section headers, preserving the headers
    const sections = normalizedDescription.split(/(Key Features:|Care Instructions:)/);

    if (sections.length > 1) {
      // First part is the intro (before "Key Features:")
      intro = sections[0].trim();
      console.log('Intro:', intro); // Debug log

      // Parse features if "Key Features:" section exists
      const featuresIndex = sections.indexOf('Key Features:');
      if (featuresIndex !== -1 && featuresIndex + 1 < sections.length) {
        let featuresText = sections[featuresIndex + 1].trim();
        // If "Care Instructions:" exists, limit featuresText to before that section
        const careIndex = sections.indexOf('Care Instructions:');
        if (careIndex !== -1) {
          featuresText = sections[featuresIndex + 1].split('Care Instructions:')[0].trim();
        }
        // Extract bullet points (lines starting with "-")
        features = featuresText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-') && line.length > 1) // Ensure the line isn't just a dash
          .map(line => line.replace(/^-/, '').trim()) // Remove the "-" and trim
          .filter(line => line.length > 0); // Remove empty lines
        console.log('Features:', features); // Debug log
      }

      // Parse care instructions if "Care Instructions:" section exists
      const careIndex = sections.indexOf('Care Instructions:');
      if (careIndex !== -1 && careIndex + 1 < sections.length) {
        let careText = sections[careIndex + 1].trim();
        // Extract bullet points (lines starting with "-")
        careInstructions = careText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-') && line.length > 1) // Ensure the line isn't just a dash
          .map(line => line.replace(/^-/, '').trim()) // Remove the "-" and trim
          .filter(line => line.length > 0); // Remove empty lines
        console.log('Care Instructions:', careInstructions); // Debug log
      }
    }
  }

  if (loading) return <div className="product-view"><p>Loading...</p></div>;
  if (error) return <div className="product-view"><p>{error}</p></div>;
  if (!product) return <div className="product-view"><p>Product not found.</p></div>;

  const isInWishlist = wishlist.some((item) => item.id === parseInt(product.id));
  const isOutOfStock = !inventory || inventory.stockQuantity <= 0;

  return (
    <div className="product-view">
      <div className="product-view__container">
        <div className="product-view__images">
          <div className="product-view__thumbnails">
            <img 
              src={thumbnailImage} 
              alt={`${product.productName} thumbnail`}
              onClick={handleThumbnailClick}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder.png";
              }}
            />
          </div>
          <div className="product-view__main-image">
            <img 
              src={mainImage} 
              alt={product.productName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/placeholder.png";
              }}
            />
          </div>
        </div>
        
        <div className="product-view__details">
          <h1 className="product-view__title">{product.productName}</h1>
          
          <div className="product-view__rating">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={18}
                fill={index < product.rating ? '#FFD700' : 'none'}
                stroke={index < product.rating ? '#FFD700' : '#ccc'}
              />
            ))}
            <span>({product.rating || 0} reviews)</span>
          </div>
          
          <div className="product-view__price">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="product-view__options">
            {availableColors.length > 0 && (
              <div className="product-view__color-select">
                <label>Color</label>
                <div className="product-view__colors">
                  {availableColors.map((color) => (
                    <div
                      key={color.id || color.color_id}
                      className={`product-view__color-btn ${selectedColor === color.color_name ? 'product-view__color-btn--selected' : ''}`}
                      onClick={() => setSelectedColor(color.color_name)}
                    >
                      <div 
                        className="product-view__color-btn-circle"
                        style={{ 
                          backgroundColor: getColorHexCode(color.color_name) 
                        }}
                      ></div>
                      <span className="product-view__color-btn-label">{color.color_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {availableSizes.length > 0 && (
              <div className="product-view__size-select">
                <label>Size</label>
                <div className="product-view__sizes">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id || size.size_id}
                      className={`product-view__size-btn ${selectedSize === size.size_name ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size.size_name)}
                    >
                      {size.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={`product-view__stock ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock 
              ? "Out of Stock" 
              : `In Stock (${inventory.stockQuantity} available)`}
          </div>
          
          <div className="product-view__actions">
            <button 
              className="product-view__wishlist-btn"
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              <Heart
                size={20}
                fill={isInWishlist ? 'currentColor' : 'none'}
              />
              Wishlist
            </button>
            
            <div className="product-view__cart-actions">
              <button 
                className="product-view__cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock || 
                  (availableSizes.length > 0 && !selectedSize) || 
                  (availableColors.length > 0 && !selectedColor)}
              >
                <ShoppingCart size={20} />
                {((availableSizes.length === 0 || selectedSize) && 
                  (availableColors.length === 0 || selectedColor)) 
                  ? 'Add to Cart' : 'Select Options'}
              </button>
              
              <button 
                className="product-view__buy-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock || 
                  (availableSizes.length > 0 && !selectedSize) || 
                  (availableColors.length > 0 && !selectedColor)}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Section */}
      <div className="product-description">
        <h2 className="product-description__title">Product Description</h2>
        <div className="product-description__content">
          <p className="product-description__intro">{intro}</p>
          {features.length > 0 && (
            <>
              <h3 className="product-description__subtitle">Key Features:</h3>
              <ul className="product-description__list">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </>
          )}
          {careInstructions.length > 0 && (
            <>
              <h3 className="product-description__subtitle">Care Instructions:</h3>
              <ul className="product-description__list">
                {careInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;