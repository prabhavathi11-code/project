import React from 'react'
import { Link } from 'react-router-dom'
import { FaGraduationCap, FaHome, FaCompass } from 'react-icons/fa'
import './index.css'

const NotFound = () => {
  return (
    <div className="notfound-container container">
      <div className="notfound-card glass-card">
        <div className="notfound-icon-wrap">
          <FaGraduationCap />
        </div>
        <span className="notfound-code">404</span>
        <h1>Lost on Campus?</h1>
        <p>The screen or listing you are looking for has been moved, graduated, or does not exist.</p>
        <div className="notfound-actions">
          <Link to="/" className="btn-primary">
            <FaHome /> Back to Home
          </Link>
          <Link to="/listings" className="btn-secondary">
            <FaCompass /> Browse Listings
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
