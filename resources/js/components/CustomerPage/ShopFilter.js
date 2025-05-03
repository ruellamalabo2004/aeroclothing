import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const ShopFilter = ({ onFilterChange }) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    types: true,
    sizes: true,
    colors: true,
    price: true,
  });
  
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    types: [],
    sizes: [],
    colors: [],
    priceRanges: [],
  });

  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const API_URL = "http://127.0.0.1:8000/api";

  // Fetch categories, product types, sizes, and colors from API
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${API_URL}/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log("Fetched categories:", categoriesData);
          setCategories(categoriesData);
        } else {
          console.error("Failed to fetch categories:", categoriesResponse.status);
        }

        // Fetch product types
        const productTypesResponse = await fetch(`${API_URL}/product_types`);
        if (productTypesResponse.ok) {
          const productTypesData = await productTypesResponse.json();
          console.log("Fetched product types:", productTypesData);
          setProductTypes(productTypesData);
        } else {
          console.error("Failed to fetch product types:", productTypesResponse.status);
        }

        // Fetch sizes
        const sizesResponse = await fetch(`${API_URL}/sizes`);
        if (sizesResponse.ok) {
          const sizesData = await sizesResponse.json();
          console.log("Fetched sizes:", sizesData);
          setSizes(sizesData);
        }

        // Fetch colors
        const colorsResponse = await fetch(`${API_URL}/colors`);
        if (colorsResponse.ok) {
          const colorsData = await colorsResponse.json();
          console.log("Fetched colors:", colorsData);
          setColors(colorsData);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilterData();
  }, []);

  // When filters change, notify parent component
  useEffect(() => {
    if (onFilterChange) {
      console.log("Sending filters to parent:", selectedFilters);
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters, onFilterChange]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (type, value) => {
    const normalizedValue = ['categories', 'types'].includes(type) ? Number(value) : value;
    console.log(`Filter change: Type=${type}, Value=${normalizedValue} (original=${value})`);
    setSelectedFilters((prev) => {
      const current = prev[type];
      if (current.includes(normalizedValue)) {
        return { ...prev, [type]: current.filter((item) => item !== normalizedValue) };
      }
      return { ...prev, [type]: [...current, normalizedValue] };
    });
  };

  const clearAllFilters = () => {
    console.log("Clearing all filters");
    setSelectedFilters({
      categories: [],
      types: [],
      sizes: [],
      colors: [],
      priceRanges: [],
    });
  };

  const toggleAllSections = () => {
    console.log("Toggling all sections visibility");
    const allVisible = Object.values(openSections).every((visible) => visible);
    setOpenSections({
      category: !allVisible,
      types: !allVisible,
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
                    onChange={() => handleFilterChange('categories', category.id)}
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
                    onChange={() => handleFilterChange('types', type.id)}
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
          <div className="filter-options">
            {['Under $50', '$50 – $100', '$100 – $200', '$200+'].map(
              (range) => (
                <label
                  key={range}
                  className={`filter-option ${
                    selectedFilters.priceRanges.includes(range) ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.priceRanges.includes(range)}
                    onChange={() => handleFilterChange('priceRanges', range)}
                  />
                  {range}
                </label>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopFilter;