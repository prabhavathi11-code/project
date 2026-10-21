import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { apiFetch } from '../../api'
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
  FaTag,
  FaSearch,
  FaStar,
  FaBolt,
  FaClock,
  FaUsers,
  FaQuestionCircle,
  FaTimesCircle
} from 'react-icons/fa'
import { handleImageError } from '../../utils/imageFallback'
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

const comparisonData = [
  {
    feature: 'Delivery Time',
    campusmart: 'Instant (10-30 Mins On-Campus)',
    others: '3 - 7 Business Days',
    highlight: true
  },
  {
    feature: 'Shipping & Delivery Fees',
    campusmart: '₹0 Completely Free',
    others: '₹40 - ₹120 per package',
    highlight: true
  },
  {
    feature: 'Prepayment Fraud Risk',
    campusmart: 'Zero (Inspect & Pay COD / UPI)',
    others: 'High Risk / Advance Payments',
    highlight: true
  },
  {
    feature: 'Academic Syllabus Alignment',
    campusmart: 'Filter by Branch & Semester (CS201, etc.)',
    others: 'Generic Retail, Wrong Editions',
    highlight: true
  },
  {
    feature: 'Seller Identity',
    campusmart: 'Verified College Students & Seniors',
    others: 'Unknown Strangers off-campus',
    highlight: true
  }
]

const Home = () => {
  const { isAuthenticated, isSeller } = useUser()
  const navigate = useNavigate()
  const [trendingListings, setTrendingListings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await apiFetch('/api/listings/?page_size=4&ordering=-rating')
        if (response.ok) {
          const data = await response.json()
          setTrendingListings(data.results || [])
        }
      } catch (err) {
        console.error('Error fetching trending listings:', err)
      }
    }
    fetchTrending()
  }, [])

  const handleHeroSearch = e => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/listings')
    }
  }

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
            Buy & Sell Campus Essentials with <span className="highlight-text">Zero Middlemen</span>
          </h1>

          <p className="hero-subtitle">
            Need a scientific calculator for tomorrow's exam, a cycle to cross campus, or core semester books? 
            CampusMart connects students across all hostels for safe, verified on-campus handovers.
          </p>

          {/* Quick Real-World Search Bar in Hero */}
          <form className="hero-search-bar glass-card" onSubmit={handleHeroSearch}>
            <FaSearch className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search by book name, 'Casio calculator', 'Hero cycle', course code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              Search Deals
            </button>
          </form>

          <div className="hero-cta-group">
            <Link to="/listings" className="btn-primary hero-btn">
              Explore 54+ Listings <FaArrowRight />
            </Link>

            {!isAuthenticated ? (
              <Link to="/login" className="btn-secondary hero-btn senior-cta">
                <FaTag /> Unlock Senior Clearance Deals
              </Link>
            ) : isSeller ? (
              <Link to="/seller" className="btn-secondary hero-btn">
                Open Seller Dashboard
              </Link>
            ) : (
              <Link to="/orders" className="btn-secondary hero-btn">
                Track My Orders
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
              <span className="stat-label">Safe Meetup Hubs</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">100%</span>
              <span className="stat-label">Cash on Inspection</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <span className="stat-number">₹0</span>
              <span className="stat-label">Delivery Charges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Live Trending Deals Section */}
      {trendingListings.length > 0 && (
        <section className="trending-section container">
          <div className="section-header">
            <div>
              <span className="sub-badge"><FaBolt /> Hot Campus Handover Deals</span>
              <h2 className="section-title">Trending Essentials from Fellow Students</h2>
            </div>
            <Link to="/listings" className="view-all-link">
              View All 54 Items <FaArrowRight />
            </Link>
          </div>

          <div className="trending-grid">
            {trendingListings.map(item => (
              <Link to={`/listings/${item.id}`} key={item.id} className="trending-card glass-card">
                <div className="trending-media">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={e => handleImageError(e, item.category)}
                  />
                  <span className="trending-cond-badge">{item.condition}</span>
                  {item.is_senior_deal && (
                    <span className="trending-senior-badge">Senior Deal</span>
                  )}
                </div>
                <div className="trending-content">
                  <span className="trending-cat">{item.category}</span>
                  <h4 title={item.title}>{item.title}</h4>
                  <div className="trending-meta">
                    <span className="trending-hostel"><FaMapMarkerAlt /> {item.hostel}</span>
                    <span className="trending-rating"><FaStar /> {item.rating}</span>
                  </div>
                  <div className="trending-price-row">
                    <span className="trending-price">₹{item.price}</span>
                    <span className="btn-mini-view">Inspect & Buy</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Showcase */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <span className="sub-badge">Academic & Dorm Essentials</span>
            <h2 className="section-title">Explore by Department & Need</h2>
            <p className="section-subtitle">Find textbooks, electronics, dorm essentials, and campus cycles</p>
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

      {/* Why CampusMart vs Traditional E-Commerce / Open Classifieds */}
      <section className="comparison-section container">
        <div className="comparison-card glass-card">
          <div className="section-header center">
            <span className="sub-badge"><FaShieldAlt /> Real-World Impact</span>
            <h2 className="section-title">Why CampusMart is Better than Amazon & OLX</h2>
            <p className="section-subtitle">Tailored specifically to the safety and budget of college campus life</p>
          </div>

          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="campus-col">🎓 CampusMart</th>
                  <th className="others-col">📦 Amazon / OLX / Classifieds</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="feature-name"><strong>{row.feature}</strong></td>
                    <td className="campus-col">
                      <span className="check-badge"><FaCheckCircle /> {row.campusmart}</span>
                    </td>
                    <td className="others-col">
                      <span className="cross-badge"><FaTimesCircle /> {row.others}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verified Safe Meetup Locations Showcase */}
      <section className="meetups-home-section container">
        <div className="section-header center">
          <span className="sub-badge"><FaMapMarkerAlt /> 100% Safe On-Campus Commerce</span>
          <h2 className="section-title">3 Verified Campus Meetup Points</h2>
          <p className="section-subtitle">Choose where you want to inspect and collect your items</p>
        </div>

        <div className="meetups-home-grid">
          <div className="meetup-home-card glass-card">
            <div className="spot-header library">
              <FaBook />
            </div>
            <h3>Library Steps</h3>
            <p>Peaceful, well-lit academic landmark. Ideal for course textbooks, calculators, and exam notes.</p>
            <span className="spot-tag"><FaClock /> Best: 1:00 PM - 2:00 PM</span>
          </div>

          <div className="meetup-home-card glass-card">
            <div className="spot-header gate">
              <FaBicycle />
            </div>
            <h3>Main Gate Arch</h3>
            <p>Spacious, monitored security area. Perfect for test-riding bicycles and carrying bulky dorm furniture.</p>
            <span className="spot-tag"><FaClock /> Best: 4:30 PM - 7:00 PM</span>
          </div>

          <div className="meetup-home-card glass-card">
            <div className="spot-header canteen">
              <FaUsers />
            </div>
            <h3>Student Canteen</h3>
            <p>Lively daytime cafeteria hub. Great spot to test electronic devices, chargers, and power banks over a cup of tea.</p>
            <span className="spot-tag"><FaClock /> Best: 11:30 AM - 5:30 PM</span>
          </div>
        </div>
      </section>

      {/* Senior Deals Highlight Banner */}
      <section className="senior-banner-section container">
        <div className="senior-banner-card">
          <div className="senior-banner-content">
            <span className="senior-tag">🎓 Graduating Senior Clearance Hub</span>
            <h2>Final-Year Students Sell Cheap Before Leaving Campus!</h2>
            <p>
              Final-year seniors clearing out their dorm rooms pass along calculators, Arduino kits, bicycles, and complete semester textbook sets at up to 70% off retail store prices. Sign in with your campus account to unlock these deals.
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
