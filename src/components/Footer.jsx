import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-main">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">C Guard</h3>
            <p className="footer-description">
              Chenab River Flood Forecasting & Early Warning System
            </p>
            <p className="footer-tagline">
              Protecting lives with early flood risk insights
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Home
              </li>
              <li onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Flood Map
              </li>
              <li onClick={() => document.getElementById('emergency')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Emergency
              </li>
              <li onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                Contact Us
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact-item">
              <span className="contact-icon">📧</span>
              <span>Cguard@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📞</span>
              <span>+92 300 1234567</span>
            </div>
            <div className="footer-contact-item">
              <span className="contact-icon">📍</span>
              <span>Chenab River Basin, Pakistan</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} C Guard | Final Year Project</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
