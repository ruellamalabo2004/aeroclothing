import React from 'react';


const ScrollingText = () => {
  const brands = [
    { name: 'PRADA', logo: '/images/prada.svg' },
    { name: 'BALENCIAGA', logo: '/images/balenciaga.svg' },
    { name: 'LOUIS VUITTON', logo: '/images/lv.svg' },
    { name: 'NIKE', logo: '/images/nike.svg' }, // Replaced Supreme with Nike
    { name: 'OFF-WHITE', logo: '/images/offwhite.svg' },
    { name: 'JORDAN', logo: '/images/jordan.svg' },
  ];


  const extendedBrands = [...brands, ...brands, ...brands, ...brands, ...brands];

  return (
    <div className="scrolling-text">
      <div className="scrolling-text__wrapper">
        {extendedBrands.map((brand, index) => (
          <div key={index} className="scrolling-text__item">
            <img src={brand.logo} alt={`${brand.name} logo`} className="scrolling-text__logo" />
            <span className="scrolling-text__name">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingText;