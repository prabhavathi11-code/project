import React from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import {
  FaBook,
  FaLaptop,
  FaHome,
  FaBicycle,
  FaArrowRight,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaHandshake,
  FaGraduationCap,
  FaCheckCircle,
  FaTag
} from 'react-icons/fa'
import './index.css'

const categories = [
  {
    name: 'Books',
    icon: FaBook,
    count: '15 Listings',
    desc: 'Engineering mathematics, algorithms, GATE guides, and core semester textbooks.',
    color: '#6366f1'
  },
  {
    name: 'Electronics',
    icon: FaLaptop,
    count: '14 Listings',
    desc: 'Scientific calculators, Bluetooth headphones, Arduino kits, and USB peripherals.',
    color: '#8b5cf6'
  },
  {
    name: 'Hostel Essentials',
    icon: FaHome,
    count: '13 Listings',
    desc: 'Electric kettles, study desk tables, LED lamps, and modular dorm organizers.',
    color: '#10b981'
  },
  {
    name: 'Cycles',
    icon: FaBicycle,
    count: '12 Listings',
    desc: 'Geared MTBs, campus commuter bicycles, helmet gear, and heavy-duty wire locks.',
    color: '#f59e0b'
  }
]

const Home = () => {
  const { isAuthenticated, isSeller, user } = useUser()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="container hero-container">
          <div className="hero-badge">
            <FaGraduationCap className="badge-icon" /> Exclusive Student-to-Student Marketplace
          </div>

          <h1 className="hero-title">
            Buy & Sell Pre-Loved Campus Essentials with <span className="highlight-text">Zero Middlemen</span>
          </h1>

          <p className="hero-subtitle">
            Need a scientific calculator for tomorrow's exam, a cycle to get across campus, or textbook bundles? 
            CampusMart connects students across all hostels for safe on-campus handovers.
          </p>

          <div className="hero-cta-group">
            <Link to="/listings" className="btn-primary hero-btn">
              Explore All Listings <FaArrowRight />
            </Link>

            {!isAuthenticated ? (
              <Link to="/login" className="btn-secondary hero-btn senior-cta">
                <FaTag /> Unlock Senior-Only Deals
              </Link>
            ) : isSeller ? (
              <Link to="/seller" className="btn-secondary hero-btn">
                Open Seller Dashboard
              </Link>
            ) : (
              <Link to="/orders" className="btn-secondary hero-btn">
                View My Orders
              </Link>
            )}
          </div>

          {/* Key Stats Bar */}
          <div className="stats-strip">
            <div className="stat-card">
              <span className="stat-number">54+</span>
              <span className="stat-label">Verified Listings</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">3</span>
              <span className="stat-label">Safe Meetup Points</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Campus Verified</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">₹0</span>
              <span className="stat-label">Delivery Charges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore by Department & Need</h2>
            <p className="section-subtitle">Find exactly what you need for this semester from fellow students</p>
          </div>
          <Link to="/listings" className="view-all-link">
            See all 54 listings <FaArrowRight />
          </Link>
        </div>

        <div className="categories-grid">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.name}
                to={`/listings?category=${encodeURIComponent(cat.name)}`}
                className="category-card glass-card"
              >
                <div className="cat-icon-box" style={{ background: `${cat.color}20`, color: cat.color }}>
                  <Icon />
                </div>
                <div className="cat-meta">
                  <h3 className="cat-name">{cat.name}</h3>
                  <span className="cat-count">{cat.count}</span>
                </div>
                <p className="cat-desc">{cat.desc}</p>
                <div className="cat-footer">
                  <span className="cat-action">Browse category</span>
                  <FaArrowRight className="cat-arrow" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section container">
        <div className="how-it-works-box glass-card">
          <div className="section-header center">
            <h2 className="section-title">How CampusMart Works</h2>
            <p className="section-subtitle">Safe, simple, and cash-at-handover commerce in 3 steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-badge">1</div>
              <div className="step-icon-circle"><FaBook /></div>
              <h4>Browse & Order</h4>
              <p>Explore listings from your campus peers, filter by hostel and condition, and add to your cart.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">2</div>
              <div className="step-icon-circle"><FaMapMarkerAlt /></div>
              <h4>Choose Meetup Point</h4>
              <p>Select your preferred campus landmark: Library Steps, Main Gate, or Canteen for pickup.</p>
            </div>

            <div className="step-card">
              <div className="step-badge">3</div>
              <div className="step-icon-circle"><FaHandshake /></div>
              <h4>Inspect & Pay</h4>
              <p>Meet the seller, verify the item condition in person, and settle with Cash on Delivery or UPI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Senior Deals Highlight Banner */}
      <section className="senior-banner-section container">
        <div className="senior-banner-card">
          <div className="senior-banner-content">
            <span className="senior-tag">🎓 Graduating Senior Clearance</span>
            <h2>Final-Year Students Sell Cheap Before Leaving Campus!</h2>
            <p>
              Final-year seniors clearing out their dorm rooms list calculators, lab kits, cycles, and textbook sets at pass-along discount prices. Sign in with your campus account to unlock these deals.
            </p>
            <div className="senior-banner-cta">
              <Link to="/listings" className="btn-primary">
                Browse Senior Deals <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
