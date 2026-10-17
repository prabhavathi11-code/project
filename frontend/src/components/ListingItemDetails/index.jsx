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
  FaTag
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
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

  if (loading) {
    return (
      <div className="loading-box container">
        <PulseLoader size={12} color="#6366f1" />
        <p>Loading listing details...</p>
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
            This listing is a member-only deal posted by a graduating senior.
            Please sign in with your campus account to view the details and place an order.
          </p>
          <div className="error-actions">
            <Link to="/login" className="btn-primary" state={{ from: { pathname: `/listings/${id}` } }}>
              Sign In Now
            </Link>
            <Link to="/listings" className="btn-secondary">
              Back to Listings
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
          <p>The listing you are trying to view does not exist or may have been removed.</p>
          <Link to="/listings" className="btn-primary">
            <FaArrowLeft /> Return to Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="listing-details-page container">
      {/* Back button */}
      <Link to="/listings" className="back-link">
        <FaArrowLeft /> Back to all listings
      </Link>

      <div className="details-grid">
        {/* Left: Image Showcase */}
        <div className="details-media-box glass-card">
          <img src={listing.imageUrl} alt={listing.title} className="details-hero-img" />
          {listing.is_senior_deal && (
            <span className="badge badge-senior details-badge-senior">
              🎓 Senior-Only Deal
            </span>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="details-info-box glass-card">
          <div className="details-header-meta">
            <span className="details-category">{listing.category}</span>
            <span className="details-hostel">
              <FaMapMarkerAlt /> {listing.hostel}
            </span>
          </div>

          <h1 className="details-title">{listing.title}</h1>

          {/* Rating & Condition Row */}
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

          {/* Price */}
          <div className="details-price-row">
            <span className="price-label">Campus Asking Price:</span>
            <div className="price-val-wrap">
              <span className="details-currency">₹</span>
              <span className="details-price">{listing.price}</span>
            </div>
          </div>

          {/* Description */}
          <div className="details-desc-block">
            <h4>Seller's Note & Description:</h4>
            <p>{listing.description || 'No detailed description provided by the student seller.'}</p>
          </div>

          {/* Campus Meetup Guarantee Box */}
          <div className="meetup-guarantee-box">
            <FaShieldAlt className="guarantee-icon" />
            <div>
              <strong>Verified Campus Handover</strong>
              <p>Meet the seller at Library Steps, Main Gate, or Canteen. Pay with Cash or UPI once inspected.</p>
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
                >
                  <FaMinus />
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <FaPlus />
                </button>
              </div>

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
            </div>
          ) : (
            <div className="sold-out-banner">
              This item has been marked as Sold by the seller.
            </div>
          )}
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <section className="similar-listings-section">
          <h2 className="similar-heading">Similar Items from Other Students</h2>
          <div className="similar-grid">
            {similarListings.map(item => (
              <Link to={`/listings/${item.id}`} key={item.id} className="similar-card glass-card">
                <img src={item.imageUrl} alt={item.title} />
                <div className="similar-card-body">
                  <h4>{item.title}</h4>
                  <div className="similar-price-row">
                    <span className="price">₹{item.price}</span>
                    <span className="hostel">{item.hostel}</span>
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
