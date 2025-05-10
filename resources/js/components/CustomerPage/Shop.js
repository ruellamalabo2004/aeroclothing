import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import ShopFilter from '../CustomerPage/ShopFilter';
import ShopMain from '../CustomerPage/ShopMain';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    types: [],
    brands: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 1000 }
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setActiveFilters(prev => ({
        ...prev,
        categories: [Number(categoryId)]
      }));
    }
  }, [searchParams]);
  
  // Memoize the filter change handler
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
  }, []);

  // Memoize the toggle filters handler
  const toggleFilters = useCallback(() => {
    setFiltersVisible(prev => !prev);
  }, []);

  return (
    <div className="shop">
      <Header />
      <div className="shop__container">
        <main className="shop__content">
          {filtersVisible && (
            <ShopFilter 
              onFilterChange={handleFilterChange} 
              initialFilters={activeFilters}
            />
          )}
          <ShopMain 
            toggleFilters={toggleFilters} 
            activeFilters={activeFilters}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;