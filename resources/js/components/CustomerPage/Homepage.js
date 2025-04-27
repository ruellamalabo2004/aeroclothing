  import React from 'react';
  import Header from '../HeaderContent/Header';
  import Hero from '../CustomerPage/Hero';
  import ScrollingText from '../LoginContent/ScrollingText';
  import NewArrival from '../LoginContent/NewArrival';
  import SecondContent from '../LoginContent/SecondContent'; 
  import ShopCategory from '../LoginContent/ShopCategory';
  import Footer from '../FooterContent/Footer';


  const Homepage = () => {
    return (
      <div className="homepage">
        <Header />
        <Hero />
        <ScrollingText />
        <NewArrival />
        <SecondContent /> {/* Add SecondContent below NewArrival */}
        <ShopCategory />
        <Footer />
      </div>
    );
  };

  export default Homepage;