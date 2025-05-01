import React from 'react';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import ViewProduct from './ViewProduct'; // Import ViewProduct


const ProductMain = () => {
  return (
    <div className="product-main">
      <Header />
      <ViewProduct />
      <Footer />
    </div>
  );
};

export default ProductMain;