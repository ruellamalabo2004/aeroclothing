import React, { useState } from 'react';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import ShopFilter from '../CustomerPage/ShopFilter';
import ShopMain from '../CustomerPage/ShopMain';

const Shop = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    priceRanges: []
  });
  
  // Handle filter changes from ShopFilter component
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // For mobile devices, you may want to add a toggle button
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="shop">
      <Header />
      <div className="shop__container">
        <main className="shop__content">
          {filtersVisible && <ShopFilter onFilterChange={handleFilterChange} />}
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