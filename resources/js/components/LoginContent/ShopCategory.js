import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ShopCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Map the categories to include images and links
          const mappedCategories = data.map(category => ({
            id: category.id,
            title: category.name,
            image: `/images/${category.name.toLowerCase()}c.png`,
            link: `/shop?category=${category.id}`
          }));
          setCategories(mappedCategories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="shop-category">
        <div className="shop-category__header">
          <div className="shop-category__title-container">
            <h2 className="shop-category__title">Shop by Category</h2>
            <h3 className="shop-category__subtitle">
              Loading categories...
            </h3>
          </div>
        </div>
      </section>
    );
  }

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
        {categories.map((category) => (
          <Link to={category.link} key={category.id} className="shop-category__card">
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