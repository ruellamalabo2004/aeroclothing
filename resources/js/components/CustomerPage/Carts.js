import React from 'react';
import Header from '../HeaderContent/Header';
import ViewCart from './ViewCart';
import CartSummary from './CartSummary';

const Carts = () => {
  return (
    <div className="carts">
      <Header />
      <div className="carts-content">
        <h1 className="carts-title">MY CART</h1>
        <div className="carts-container">
          <ViewCart />
          <CartSummary />
        </div>
      </div>
    </div>
  );
};

export default Carts;