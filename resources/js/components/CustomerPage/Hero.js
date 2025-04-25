import React from 'react';


const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Timeless Style<br />Modern Living
        </h1>
        <p className="hero__description">
          Discover our curated collection of minimalist essentials designed for the contemporary wardrobe.
        </p>
        <div className="hero__buttons">
          <button className="hero__button hero__button--primary">Shop Collection</button>
          <button className="hero__button hero__button--secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;