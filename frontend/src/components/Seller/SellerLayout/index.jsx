import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  FaChartLine,
  FaBoxes,
  FaPlusCircle,
  FaTruck,
  FaStore
} from 'react-icons/fa'
import './index.css'

const SellerLayout = () => {
  return (
    <div className="seller-hub-container container">
      {/* Seller Header & Navigation */}
      <div className="seller-hub-header">
        <div className="seller-header-title-wrap">
          <div className="seller-badge-icon">
            <FaStore />
          </div>
          <div>
            <h1>Seller Operations Hub</h1>
            <p>Manage your campus listings, track deliveries to meetup points, and monitor earnings</p>
          </div>
        </div>

        {/* Subnavigation Tabs */}
        <nav className="seller-nav-tabs">
          <NavLink
            to="/seller"
            end
            className={({ isActive }) => (isActive ? 'seller-tab active' : 'seller-tab')}
          >
            <FaChartLine /> Dashboard Overview
          </NavLink>

          <NavLink
            to="/seller/listings"
            className={({ isActive }) => (isActive ? 'seller-tab active' : 'seller-tab')}
          >
            <FaBoxes /> My Listings
          </NavLink>

          <NavLink
            to="/seller/listings/new"
            className={({ isActive }) => (isActive ? 'seller-tab active' : 'seller-tab')}
          >
            <FaPlusCircle /> Add New Listing
          </NavLink>

          <NavLink
            to="/seller/orders"
            className={({ isActive }) => (isActive ? 'seller-tab active' : 'seller-tab')}
          >
            <FaTruck /> Orders to Hand Over
          </NavLink>
        </nav>
      </div>

      {/* Child Route Content */}
      <div className="seller-content-area">
        <Outlet />
      </div>
    </div>
  )
}

export default SellerLayout
