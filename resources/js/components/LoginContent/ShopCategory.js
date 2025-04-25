import React from 'react';
import { Link } from 'react-router-dom';

const ShopCategory = () => {
  const categories = [
    {
      title: 'Women',
      image: '/images/womenc.png',
      link: '/shop/womens',
    },
    {
      title: 'Men',
      image: '/images/menc.png',
      link: '/shop/mens',
    },
    {
      title: 'Girls',
      image: '/images/girlc.png',
      link: '/shop/girls',
    },
    {
      title: 'Boys',
      image: '/images/boyc.png',
      link: '/shop/boys',
    },
  ];

  return (
    <section className="shop-category">
      <div className="shop-category__header">
        <div className="shop-category__title-container">
          <h2 className="shop-category__title">Shop by Category</h2>
          <h3 className="shop-category__subtitle">
          Timeless styles curated for every taste and occasion.
          </h3>
        </div>
      </div>
      <div className="shop-category__cards">
        {categories.map((category, index) => (
          <Link to={category.link} key={index} className="shop-category__card">
            <div className="shop-category__image-container">
              <img src={category.image} alt={`${category.title} fashion`} className="shop-category__image" />
            </div>
            <h3 className="shop-category__card-title">{category.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopCategory;