import React from 'react';
import Header from '../HeaderContent/Header';
import Footer from '../FooterContent/Footer';
import ViewCart from './ViewCart';
import CartSummary from './CartSummary';

const Carts = () => {
  return (
    <div className="carts">
      <Header />
      <div className="carts-content">
        <h1 className="carts-title">My Cart</h1>
        <div className="carts-layout">
          <ViewCart />
          <CartSummary />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Carts;