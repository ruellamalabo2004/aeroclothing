import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = [
    { label: "ORDERS & PAYMENTS", path: "/customer/support/order-payment" },
    { label: "SHIPPING", path: "/customer/support/shipping" },
    { label: "RETURNS", path: "/customer/support/returns" },
    { label: "CONTACT US", path: "/customer/support/contact-us" },
    { label: "TERMS AND SERVICES", path: "/customer/support/terms-and-service" },
    { label: "FAQS", path: "/customer/support/faqs" },
  ];

  const socialIcons = [
    { src: '/imgs/instagram.svg', alt: 'Instagram' },
    { src: '/imgs/facebook.svg', alt: 'Facebook' },
    { src: '/imgs/twitter.svg', alt: 'Twitter' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          {footerLinks.map((link, index) => (
            <Link key={index} to={link.path} className="footer-link">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="footer-socials">
          <span>SOCIALS</span>
          <div className="social-icons">
            {socialIcons.map((icon, index) => (
              <img key={index} src={icon.src} alt={icon.alt} className="social-icon" />
            ))}
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        <p>@2025 AERO. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;