import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const ShopFilter = ({ onFilterChange, initialFilters }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    types: true,
    brands: true,
    sizes: true,
    colors: true,
    price: true,
  });
  
  const [selectedFilters, setSelectedFilters] = useState(initialFilters || {
    categories: [],
    types: [],
    brands: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 1000 },
  });

  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const API_URL = "http://127.0.0.1:8000/api";

  // Update selectedFilters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setSelectedFilters(initialFilters);
    }
  }, [initialFilters]);

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, typesRes, brandsRes, sizesRes, colorsRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/product_types`),
          fetch(`${API_URL}/brands`),
          fetch(`${API_URL}/sizes`),
          fetch(`${API_URL}/colors`)
        ]);

        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (typesRes.ok) setProductTypes(await typesRes.json());
        if (brandsRes.ok) setBrands(await brandsRes.json());
        if (sizesRes.ok) setSizes(await sizesRes.json());
        if (colorsRes.ok) setColors(await colorsRes.json());
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilterData();
  }, []);

  // Memoize the filter change handler
  const handleFilterChange = useCallback((type, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      const current = prev[type];
      
      if (current.includes(value)) {
        newFilters[type] = current.filter(item => item !== value);
      } else {
        newFilters[type] = [...current, value];
      }
      
      return newFilters;
    });
  }, []);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceChange = (type, value) => {
    setSelectedFilters(prev => {
      const newPriceRange = {
        ...prev.priceRange,
        [type]: Number(value)
      };
      
      if (type === 'min' && newPriceRange.min > newPriceRange.max) {
        newPriceRange.min = newPriceRange.max;
      }
      if (type === 'max' && newPriceRange.max < newPriceRange.min) {
        newPriceRange.max = newPriceRange.min;
      }
      
      return {
        ...prev,
        priceRange: newPriceRange
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      types: [],
      brands: [],
      sizes: [],
      colors: [],
      priceRange: { min: 0, max: 1000 },
    });
  };

  const toggleAllSections = () => {
    const allVisible = Object.values(openSections).every((visible) => visible);
    setOpenSections({
      category: !allVisible,
      types: !allVisible,
      brands: !allVisible,
      sizes: !allVisible,
      colors: !allVisible,
      price: !allVisible,
    });
  };

  return (
    <div className="shop-filter">
      {/* Filter Header */}
      <div className="filter-header">
        <SlidersHorizontal size={18} />
        <h2>Filter</h2>
      </div>

      {/* Clear All Filters Button */}
      <button 
        className="clear-filters-button"
        onClick={clearAllFilters}
      >
        Clear All Filters
      </button>

      {/* Toggle Sections Button */}
      <button 
        className="toggle-sections-button"
        onClick={toggleAllSections}
      >
        {Object.values(openSections).every((visible) => visible) ? 'Hide All' : 'Show All'}
      </button>
      
      {/* Category Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('category')}>
          Category
          {openSections.category ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.category && (
          <div className="filter-options">
            {categories.length > 0 ? (
              categories.map((category) => (
                <label
                  key={category.id}
                  className={`filter-option ${
                    selectedFilters.categories.includes(Number(category.id)) ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(Number(category.id))}
                    onChange={() => handleFilterChange('categories', Number(category.id))}
                  />
                  {category.name || category.category_name || `Category ${category.id}`}
                </label>
              ))
            ) : (
              <p className="loading-text">Loading categories...</p>
            )}
          </div>
        )}
      </div>

      {/* Types Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('types')}>
          Types
          {openSections.types ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.types && (
          <div className="filter-options">
            {productTypes.length > 0 ? (
              productTypes.map((type) => (
                <label
                  key={type.id}
                  className={`filter-option ${
                    selectedFilters.types.includes(Number(type.id)) ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.types.includes(Number(type.id))}
                    onChange={() => handleFilterChange('types', Number(type.id))}
                  />
                  {type.type_name || `Type ${type.id}`}
                </label>
              ))
            ) : (
              <p className="loading-text">Loading types...</p>
            )}
          </div>
        )}
      </div>

      {/* Brands Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('brands')}>
          Brands
          {openSections.brands ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.brands && (
          <div className="filter-options">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <label
                  key={brand.id}
                  className={`filter-option ${
                    selectedFilters.brands.includes(Number(brand.id)) ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.brands.includes(Number(brand.id))}
                    onChange={() => handleFilterChange('brands', Number(brand.id))}
                  />
                  {brand.name || brand.brand_name || brand.brandName || `Brand ${brand.id}`}
                </label>
              ))
            ) : (
              <p className="loading-text">Loading brands...</p>
            )}
          </div>
        )}
      </div>

      {/* Sizes Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('sizes')}>
          Sizes
          {openSections.sizes ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.sizes && (
          <div className="size-options">
            {sizes.length > 0 ? (
              sizes.map((size) => (
                <button
                  key={size.id}
                  className={`size-button ${
                    selectedFilters.sizes.includes(size.id) ? 'active' : ''
                  }`}
                  onClick={() => handleFilterChange('sizes', size.id)}
                >
                  {size.size_name}
                </button>
              ))
            ) : (
              <p className="loading-text">Loading sizes...</p>
            )}
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('colors')}>
          Colors
          {openSections.colors ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.colors && (
          <div className="color-options">
            {colors.length > 0 ? (
              colors.map((color) => {
                const colorValue = color.color_name.toLowerCase();
                return (
                  <span
                    key={color.id}
                    className={`color-circle ${
                      selectedFilters.colors.includes(color.id) ? 'active' : ''
                    }`}
                    style={{
                      backgroundColor: colorValue,
                      border: colorValue === 'white' ? '1px solid #ccc' : 'none',
                    }}
                    onClick={() => handleFilterChange('colors', color.id)}
                    title={color.color_name}
                  ></span>
                );
              })
            ) : (
              <p className="loading-text">Loading colors...</p>
            )}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="filter-section">
        <h3 className="filter-title" onClick={() => toggleSection('price')}>
          Price Range
          {openSections.price ? (
            <ChevronUp size={16} className="dropdown-arrow" />
          ) : (
            <ChevronDown size={16} className="dropdown-arrow" />
          )}
        </h3>
        {openSections.price && (
          <div className="price-range-container">
            <div className="price-inputs">
              <div className="price-input">
                <label>Min: ${selectedFilters.priceRange.min}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={selectedFilters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                />
              </div>
              <div className="price-input">
                <label>Max: ${selectedFilters.priceRange.max}</label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={selectedFilters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                />
              </div>
            </div>
            <div className="price-display">
              ${selectedFilters.priceRange.min} - ${selectedFilters.priceRange.max}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopFilter;