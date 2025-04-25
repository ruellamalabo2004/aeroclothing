import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__column">
          <img src="/images/GAGAS.svg" alt="GAGAS Logo" className="footer__logo" />
          <p className="footer__description">
            Modern, sustainable clothing for the conscious consumer.
          </p>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} className="footer__social-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} className="footer__social-icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter size={20} className="footer__social-icon" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Youtube size={20} className="footer__social-icon" />
            </a>
          </div>
        </div>

        <div className="footer__column">
          <h3 className="footer__column-title">Shop</h3>
          <ul className="footer__links">
            <li><Link to="/shop/men">Men</Link></li>
            <li><Link to="/shop/women">Women</Link></li>
            <li><Link to="/shop/accessories">Accessories</Link></li>
            <li><Link to="/shop/new-arrivals">New Arrivals</Link></li>
            <li><Link to="/shop/sale">Sale</Link></li>
          </ul>
        </div>

        <div className="footer__column">
          <h3 className="footer__column-title">Company</h3>
          <ul className="footer__links">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/sustainability">Sustainability</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press</Link></li>
            <li><Link to="/affiliates">Affiliates</Link></li>
          </ul>
        </div>

        <div className="footer__column">
          <h3 className="footer__column-title">Support</h3>
          <ul className="footer__links">
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2025 MINIMA. ALL RIGHTS RESERVED.
        </p>
        <div className="footer__bottom-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;