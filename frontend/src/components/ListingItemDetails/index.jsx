import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'
import {
  FaStar,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCheckCircle,
  FaArrowLeft,
  FaLock,
  FaMinus,
  FaPlus,
  FaTag,
  FaGraduationCap,
  FaShareAlt,
  FaRobot,
  FaBolt,
  FaInfoCircle,
  FaClock,
  FaUserCheck,
  FaUniversity,
  FaCoffee,
  FaDoorOpen,
  FaQuestionCircle
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import { handleImageError, getCategoryFallback } from '../../utils/imageFallback'
import './index.css'

const ListingItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useUser()
  const { addToCart } = useCart()

  const [listing, setListing] = useState(null)
  const [similarListings, setSimilarListings] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('specs')
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true)
      setErrorStatus(null)
      try {
        const response = await apiFetch(`/api/listings/${id}/`)
        if (response.status === 401) {
          setErrorStatus(401)
          setListing(null)
          return
        }
        if (!response.ok) {
          setErrorStatus(response.status)
          setListing(null)
          return
        }

        const data = await response.json()
        setListing(data)

        // Fetch similar listings
        const simRes = await apiFetch(`/api/listings/${id}/similar/`)
        if (simRes.ok) {
          const simData = await simRes.json()
          setSimilarListings(simData)
        }
      } catch (err) {
        console.error('Error fetching listing details:', err)
        setErrorStatus(500)
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
    setQuantity(1)
    setAddedSuccess(false)
    setSelectedImageIdx(0)
    setActiveTab('specs')
  }, [id, isAuthenticated])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } })
      return
    }

    try {
      await addToCart(Number(id), quantity)
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 2000)
    } catch (err) {
      alert(err.message || 'Could not add item to cart.')
    }
  }

  const handleInstantBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } })
      return
    }

    try {
      await addToCart(Number(id), quantity)
      navigate('/checkout')
    } catch (err) {
      alert(err.message || 'Could not proceed to checkout.')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="loading-box container">
        <PulseLoader size={12} color="#6366f1" />
        <p>Loading campus listing details...</p>
      </div>
    )
  }

  if (errorStatus === 401) {
    return (
      <div className="container details-error-wrap">
        <div className="auth-alert error-card glass-card">
          <FaLock className="big-lock-icon" />
          <h2>Authentication Required for Senior-Only Deal</h2>
          <p>
            This listing is an exclusive clearance deal posted by a graduating senior.
            Sign in with your campus account to view full pricing details and place an order.
          </p>
          <div className="error-actions">
            <Link to="/login" className="btn-primary" state={{ from: { pathname: `/listings/${id}` } }}>
              Sign In Now
            </Link>
            <Link to="/listings" className="btn-secondary">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (errorStatus === 404 || !listing) {
    return (
      <div className="container details-error-wrap">
        <div className="error-card glass-card">
          <h2>Listing Not Found</h2>
          <p>The campus listing you are looking for has been sold, removed, or graduated.</p>
          <Link to="/listings" className="btn-primary">
            <FaArrowLeft /> Return to Listings
          </Link>
        </div>
      </div>
    )
  }

  // Simulated retail MRP for student savings calculation
  const currentPrice = parseFloat(listing.price) || 0
  const estimatedMRP = Math.round(currentPrice * 1.55)
  const savingsAmount = Math.max(0, estimatedMRP - currentPrice)
  const savingsPercent = Math.round((savingsAmount / estimatedMRP) * 100)

  // Multi-angle thumbnail previews
  const galleryImages = [
    listing.imageUrl,
    getCategoryFallback(listing.category),
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
  ]

  return (
    <div className="listing-details-page container">
      {/* Top Breadcrumb & Share Navigation */}
      <div className="details-top-bar">
        <Link to="/listings" className="back-link">
          <FaArrowLeft /> Back to Campus Listings
        </Link>
        <button className="share-link-btn" onClick={handleShare}>
          <FaShareAlt /> {copiedLink ? 'Link Copied to Clipboard!' : 'Share Listing'}
        </button>
      </div>

      <div className="details-grid">
        {/* Left Column: Image Showcase & Thumbnail Strip */}
        <div className="details-media-column">
          <div className="details-media-box glass-card">
            <img
              src={galleryImages[selectedImageIdx] || listing.imageUrl}
              alt={listing.title}
              className="details-hero-img"
              onError={e => handleImageError(e, listing.category)}
            />

            {/* Overlay Badges */}
            <div className="media-overlay-badges">
              {listing.is_senior_deal && (
                <span className="badge badge-senior details-badge-senior">
                  🎓 Senior Clearance Deal
                </span>
              )}
              <span className="badge badge-verified">
                <FaUserCheck /> Campus Verified
              </span>
            </div>
          </div>

          {/* Interactive Thumbnail Gallery Strip */}
          <div className="thumbnail-gallery-strip">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-btn ${selectedImageIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedImageIdx(idx)}
              >
                <img
                  src={imgUrl}
                  alt={`View ${idx + 1}`}
                  onError={e => handleImageError(e, listing.category)}
                />
              </button>
            ))}
          </div>

          {/* Trust Highlights Strip under image */}
          <div className="trust-highlights-box glass-card">
            <div className="trust-item">
              <FaShieldAlt className="trust-icon" />
              <div>
                <strong>Zero Prepayment Risk</strong>
                <p>Inspect in person & pay Cash or UPI</p>
              </div>
            </div>
            <div className="trust-item">
              <FaBolt className="trust-icon lightning" />
              <div>
                <strong>Instant Campus Handover</strong>
                <p>Delivered within 24 hours at meetup spot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, Actions & Seller Profile */}
        <div className="details-info-box glass-card">
          <div className="details-header-meta">
            <span className="details-category-pill">{listing.category}</span>
            <span className="details-hostel">
              <FaMapMarkerAlt /> {listing.hostel}
            </span>
          </div>

          <h1 className="details-title">{listing.title}</h1>

          {/* Rating, Condition & Availability Row */}
          <div className="details-badges-row">
            <div className="rating-pill">
              <FaStar className="star-icon" />
              <span>{listing.rating}</span>
            </div>
            <span className="reviews-count">({listing.total_reviews} student reviews)</span>
            <span className="badge badge-condition">Condition: {listing.condition}</span>
            {listing.negotiable && (
              <span className="badge badge-negotiable">
                <FaTag /> Price Negotiable
              </span>
            )}
            <span className={`badge ${listing.availability === 'Available' ? 'badge-delivered' : 'badge-cancelled'}`}>
              {listing.availability}
            </span>
          </div>

          {/* Student Price & Savings Calculator */}
          <div className="details-pricing-panel">
            <div className="price-main-row">
              <span className="price-label">Campus Asking Price:</span>
              <div className="price-val-wrap">
                <span className="details-currency">₹</span>
                <span className="details-price">{listing.price}</span>
              </div>
              <span className="original-mrp-strike">MRP ₹{estimatedMRP}</span>
              <span className="savings-chip">Save ₹{savingsAmount} ({savingsPercent}% OFF)</span>
            </div>
            <div className="payment-modes-pill">
              <span>💳 Accepted: Cash on Delivery (COD) & On-Spot UPI</span>
            </div>
          </div>

          {/* Short Seller Description */}
          <div className="details-desc-block">
            <h4>Item Description & Seller Notes:</h4>
            <p>{listing.description || 'Verified student listing in good operational condition. Suitable for coursework and dorm living.'}</p>
          </div>

          {/* Academic & Curriculum Highlight if available */}
          {(listing.branch || listing.subject_code || listing.author) && (
            <div className="details-academic-box">
              <h4 className="acad-heading"><FaGraduationCap /> Academic & Curriculum Alignment</h4>
              <div className="academic-grid">
                {listing.branch && (
                  <div className="academic-item">
                    <span className="acad-label">Branch:</span>
                    <span className="acad-val">{listing.branch}</span>
                  </div>
                )}
                {listing.semester && (
                  <div className="academic-item">
                    <span className="acad-label">Semester:</span>
                    <span className="acad-val">Semester {listing.semester}</span>
                  </div>
                )}
                {listing.subject_code && (
                  <div className="academic-item">
                    <span className="acad-label">Course Code:</span>
                    <span className="acad-val subject-highlight">{listing.subject_code}</span>
                  </div>
                )}
                {listing.author && (
                  <div className="academic-item">
                    <span className="acad-label">Author / Publisher:</span>
                    <span className="acad-val">{listing.author}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seller Trust Profile Card */}
          <div className="seller-trust-card">
            <div className="seller-avatar">
              <FaGraduationCap />
            </div>
            <div className="seller-trust-info">
              <div className="seller-name-row">
                <strong>Campus Student Seller</strong>
                <span className="verified-seller-badge"><FaCheckCircle /> ID Verified</span>
              </div>
              <p className="seller-subtext">
                Stationed at <strong>{listing.hostel}</strong> • Typically responds in &lt; 15 mins • 100% successful handovers
              </p>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          {listing.availability === 'Available' ? (
            <div className="cart-action-group">
              <div className="qty-counter">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  title="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                  title="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                className={`btn-primary add-cart-btn ${addedSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
              >
                {addedSuccess ? (
                  <>
                    <FaCheckCircle /> Added to Cart!
                  </>
                ) : (
                  <>
                    <FaShoppingCart /> Add to Cart (₹{(Number(listing.price) * quantity).toFixed(2)})
                  </>
                )}
              </button>

              {/* Instant COD Buy */}
              <button className="btn-instant-buy" onClick={handleInstantBuy}>
                <FaBolt /> Instant COD Checkout
              </button>
            </div>
          ) : (
            <div className="sold-out-banner">
              ⚠️ This item has been marked as Sold by the seller.
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Tabbed Information Section */}
      <section className="details-extended-section glass-card">
        <div className="tabs-header-bar">
          <button
            className={`tab-nav-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <FaInfoCircle /> Item Specifications
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'meetup' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetup')}
          >
            <FaMapMarkerAlt /> Campus Meetup Points
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'safety' ? 'active' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <FaShieldAlt /> Student Safety Guide
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <FaQuestionCircle /> Campus FAQs
          </button>
        </div>

        <div className="tab-content-body">
          {/* Tab 1: Specs */}
          {activeTab === 'specs' && (
            <div className="tab-panel specs-panel">
              <h3>Detailed Specifications & Condition Report</h3>
              <div className="specs-table-grid">
                <div className="spec-row">
                  <span className="spec-name">Item Category</span>
                  <span className="spec-val">{listing.category}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Physical Condition</span>
                  <span className="spec-val">
                    <strong>{listing.condition}</strong> (Inspected with 0 structural defects)
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Hostel of Origin</span>
                  <span className="spec-val">{listing.hostel}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Price Negotiability</span>
                  <span className="spec-val">
                    {listing.negotiable ? 'Open to polite student bargaining' : 'Fixed student pass-along price'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Payment Options</span>
                  <span className="spec-val">Cash on Delivery (COD) or UPI on physical handover</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">Academic Utility</span>
                  <span className="spec-val">
                    {listing.branch ? `${listing.branch} Department • Semester ${listing.semester || '1-8'}` : 'General Campus Life Essential'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Meetup Points */}
          {activeTab === 'meetup' && (
            <div className="tab-panel meetup-panel">
              <h3>Where Does Handover Take Place?</h3>
              <p className="panel-sub">
                CampusMart orders do not ship through third-party couriers. Both parties meet directly on campus for a safe, instant, zero-shipping handover!
              </p>
              <div className="meetup-cards-grid">
                <div className="meetup-spot-card">
                  <div className="spot-icon library"><FaUniversity /></div>
                  <h4>Library Steps</h4>
                  <p>Central, peaceful study zone. Best for exchanging course textbooks, scientific calculators, and clean notes.</p>
                  <span className="spot-time"><FaClock /> Best: 1:00 PM - 2:00 PM & 5:00 PM</span>
                </div>
                <div className="meetup-spot-card">
                  <div className="spot-icon gate"><FaDoorOpen /></div>
                  <h4>Main Gate Campus Arch</h4>
                  <p>Open security post with wide pavement. Ideal for test riding campus bicycles or carrying bulky dorm gear.</p>
                  <span className="spot-time"><FaClock /> Best: 4:30 PM - 7:00 PM</span>
                </div>
                <div className="meetup-spot-card">
                  <div className="spot-icon canteen"><FaCoffee /></div>
                  <h4>Student Canteen</h4>
                  <p>Lively daytime cafe hub. Meet over tea while plugging in and testing electronics, power banks, and chargers.</p>
                  <span className="spot-time"><FaClock /> Best: 11:30 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Safety */}
          {activeTab === 'safety' && (
            <div className="tab-panel safety-panel">
              <h3>CampusMart 4-Step Safety Checklist</h3>
              <div className="safety-steps-list">
                <div className="safety-step">
                  <span className="step-num">1</span>
                  <div>
                    <strong>Never prepay unverified accounts</strong>
                    <p>Always use CampusMart Cash-on-Delivery or pay via UPI only after you physically touch and test the item.</p>
                  </div>
                </div>
                <div className="safety-step">
                  <span className="step-num">2</span>
                  <div>
                    <strong>Inspect before handover</strong>
                    <p>Check textbook pages for missing sections, test electronics power switches, and test cycle brakes before completing the transaction.</p>
                  </div>
                </div>
                <div className="safety-step">
                  <span className="step-num">3</span>
                  <div>
                    <strong>Meet in verified public campus areas</strong>
                    <p>Stick to Library Steps, Main Gate, or Canteen during daylight hours or illuminated campus walkways.</p>
                  </div>
                </div>
                <div className="safety-step">
                  <span className="step-num">4</span>
                  <div>
                    <strong>Rate fellow students</strong>
                    <p>Leave a review after purchase to help juniors and classmates find trusted campus sellers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: FAQ */}
          {activeTab === 'faq' && (
            <div className="tab-panel faq-panel">
              <h3>Frequently Asked Campus Questions</h3>
              <div className="faq-list">
                <div className="faq-item">
                  <strong>Q: How do I arrange the handover time?</strong>
                  <p>A: Once you place an order, the seller receives a notification in their Seller Hub. They will advance status to 'Shipped' when en route to your selected meetup point!</p>
                </div>
                <div className="faq-item">
                  <strong>Q: What if the item is not as described when I inspect it?</strong>
                  <p>A: You are under zero obligation to pay! Simply decline the handover on the spot. Since all orders are Cash-on-Delivery, your money remains 100% safe.</p>
                </div>
                <div className="faq-item">
                  <strong>Q: Are Senior Deals open to all students?</strong>
                  <p>A: Yes! Any signed-in student can unlock and order Senior-Only Deals. They are designed to help graduating seniors clear their rooms before convocation.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <section className="similar-listings-section">
          <h2 className="similar-heading">Similar Campus Deals You Might Like</h2>
          <div className="similar-grid">
            {similarListings.map(item => (
              <Link to={`/listings/${item.id}`} key={item.id} className="similar-card glass-card">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  onError={e => handleImageError(e, item.category)}
                />
                <div className="similar-card-body">
                  <h4>{item.title}</h4>
                  <div className="similar-price-row">
                    <span className="price">₹{item.price}</span>
                    <span className="hostel"><FaMapMarkerAlt /> {item.hostel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ListingItemDetails
