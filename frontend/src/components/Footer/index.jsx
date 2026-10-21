import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaGithub,
  FaHeart,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaServer,
  FaLaptopCode
} from 'react-icons/fa'
import './index.css'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Info Grid */}
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-logo-box">
                <FaGraduationCap />
              </div>
              <span className="footer-brand-title">CampusMart</span>
            </div>
            <p className="footer-tagline">
              The exclusive verified marketplace built for campus life. Trade textbooks, gadgets, cycles, and dorm gear safely with on-campus meetup delivery.
            </p>
            <div className="deploy-status-pill">
              <span className="pulse-dot"></span>
              <span>Live Deployment: Vite Frontend + Django REST API</span>
            </div>
          </div>

          {/* Safe Meetup Points */}
          <div className="footer-col">
            <h4 className="footer-heading">
              <FaMapMarkerAlt className="heading-icon" /> Safe Meetup Points
            </h4>
            <ul className="footer-list">
              <li>
                <strong>Library Steps:</strong> Silent zone pickup, perfect for academic texts & calculators.
              </li>
              <li>
                <strong>Main Gate:</strong> Open campus hub, ideal for cycles and large hostel equipment.
              </li>
              <li>
                <strong>Student Canteen:</strong> Friendly hangout spot for quick daytime handovers.
              </li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/listings">Browse All Listings</Link></li>
              <li><Link to="/listings?category=Books">Course Textbooks</Link></li>
              <li><Link to="/listings?category=Electronics">Electronics & Gadgets</Link></li>
              <li><Link to="/listings?category=Cycles">Campus Bicycles</Link></li>
              <li><Link to="/seller">Seller Dashboard & Sales</Link></li>
              <li><Link to="/orders">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Developer & GitHub Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Repository & Deployments</h4>
            <div className="project-links-box">
              <a
                href="https://github.com/prabhavathi11-code/project"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-btn github-link-btn"
              >
                <FaGithub /> View GitHub Repo <FaExternalLinkAlt className="ext-icon" />
              </a>

              <div className="tech-stack-badges">
                <span className="tech-badge"><FaLaptopCode /> React + Vite (Port 3000)</span>
                <span className="tech-badge"><FaServer /> Django REST (Port 8000)</span>
                <span className="tech-badge"><FaShieldAlt /> SimpleJWT & SQLite3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} CampusMart. Designed & Developed with <FaHeart className="heart-icon" /> by <strong>CampusMart Open-Source Community</strong>.
          </p>
          <div className="footer-bottom-links">
            <a href="https://github.com/prabhavathi11-code/project" target="_blank" rel="noopener noreferrer">
              Source Code
            </a>
            <span>•</span>
            <span className="license-tag">MIT License</span>
            <span>•</span>
            <span className="version-tag">CampusMart v1.0 Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
