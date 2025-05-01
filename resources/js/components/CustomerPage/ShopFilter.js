import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const ShopFilter = () => {
  const [openSections, setOpenSections] = useState({
    category: true,
    sizes: true,
    colors: true,
    price: true,
  });
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    priceRanges: [],
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((item) => item !== value) };
      }
      return { ...prev, [type]: [...current, value] };
    });
  };

  return (
    <div className="shop-filter">
      {/* Filter Header */}
      <div className="filter-header">
        <SlidersHorizontal size={18} />
        <h2>Filter</h2>
      </div>
      
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
            {['Shirts', 'Pants', 'Dresses', 'Outerwear', 'Accessories'].map(
              (category) => (
                <label
                  key={category}
                  className={`filter-option ${
                    selectedFilters.categories.includes(category) ? 'active' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(category)}
                    onChange={() => handleFilterChange('categories', category)}
                  />
                  {category}
                </label>
              )
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
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                className={`size-button ${
                  selectedFilters.sizes.includes(size) ? 'active' : ''
                }`}
                onClick={() => handleFilterChange('sizes', size)}
              >
                {size}
              </button>
            ))}
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
            {[
              { name: 'Black', color: 'black' },
              { name: 'White', color: 'white' },
              { name: 'Gray', color: 'gray' },
              { name: 'Blue', color: 'blue' },
              { name: 'Red', color: 'red' },
            ].map(({ name, color }) => (
              <span
                key={name}
                className={`color-circle ${
                  selectedFilters.colors.includes(name) ? 'active' : ''
                }`}
                style={{
                  backgroundColor: color,
                  border: color === 'white' ? '1px solid #ccc' : 'none',
                }}
                onClick={() => handleFilterChange('colors', name)}
                title={name}
              ></span>
            ))}
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