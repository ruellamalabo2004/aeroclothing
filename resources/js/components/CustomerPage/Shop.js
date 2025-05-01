import React, { useState } from 'react';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import ShopFilter from '../CustomerPage/ShopFilter';
import ShopMain from '../CustomerPage/ShopMain';

const Shop = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  
  // For mobile devices, you may want to add a toggle button
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  return (
    <div className="shop">
      <Header />
      <div className="shop__container">
        <main className="shop__content">
          {filtersVisible && <ShopFilter />}
          <ShopMain toggleFilters={toggleFilters} />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;