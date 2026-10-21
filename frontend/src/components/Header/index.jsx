import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'
import {
  FaGraduationCap,
  FaShoppingCart,
  FaUserCircle,
  FaGithub,
  FaSignOutAlt,
  FaSignInAlt,
  FaStore,
  FaBoxOpen,
  FaTags
} from 'react-icons/fa'
import './index.css'

const Header = () => {
  const { user, isAuthenticated, logout } = useUser()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <FaGraduationCap className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">CampusMart</span>
            <span className="brand-badge">Campus Only</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/listings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <FaTags className="link-icon" /> Browse Listings
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/orders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <FaBoxOpen className="link-icon" /> My Orders
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink to="/seller" className={({ isActive }) => (isActive ? 'nav-link active seller-link' : 'nav-link seller-link')}>
              <FaStore className="link-icon" /> Seller Hub
            </NavLink>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="header-actions">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/prabhavathi11-code/project"
            target="_blank"
            rel="noopener noreferrer"
            className="action-icon-btn github-btn"
            title="GitHub Repository & Code"
          >
            <FaGithub />
            <span className="action-label">GitHub</span>
          </a>

          {/* Cart Icon */}
          <Link to="/cart" className="action-icon-btn cart-btn" title="View Shopping Cart">
            <FaShoppingCart />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-info-pill">
                <FaUserCircle className="user-avatar" />
                <div className="user-meta">
                  <span className="user-name">{user?.username}</span>
                  <span className={`user-role-badge ${user?.user_type}`}>
                    {user?.user_type === 'seller' ? 'Seller' : 'Student'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Sign out">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary auth-btn">
                <FaSignInAlt /> Login
              </Link>
              <Link to="/register" className="btn-primary auth-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
