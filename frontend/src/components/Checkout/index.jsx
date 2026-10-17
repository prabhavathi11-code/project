import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../../api'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const MEETUP_POINTS = [
  {
    id: 'LIBRARY',
    name: 'Library Steps',
    desc: 'Quiet pickup zone near central campus library entrance'
  },
  {
    id: 'MAIN_GATE',
    name: 'Main Gate',
    desc: 'Open campus perimeter gate, easy for cycles and heavy packages'
  },
  {
    id: 'CANTEEN',
    name: 'Student Canteen',
    desc: 'Central bustling campus canteen during daytime lunch/break hours'
  }
]

const Checkout = () => {
  const { cartItems, totalItems, totalPrice, getCart } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()

  // 6 Address Boxes
  const [address, setAddress] = useState({
    full_name: user?.username ? `${user.username} Kumar` : '',
    phone: '9876543210',
    address: 'Room 204, Block B, Campus Hostel',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001'
  })

  // Meetup point choice: Main Gate, Library Steps or Canteen
  const [meetupPoint, setMeetupPoint] = useState('LIBRARY')

  // Payment method: Cash at Meetup or Online
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleInputChange = e => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async e => {
    e.preventDefault()
    setErrorMsg('')

    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty. Add items before placing an order.')
      return
    }

    try {
      setSubmitting(true)

      // Strict rule: DO NOT send the cart and DO NOT send the total!
      // Server already has the cart, and total sent by browser can be spoofed!
      const payload = {
        payment_method: paymentMethod,
        meetup_point: meetupPoint,
        address
      }

      const response = await apiFetch('/api/orders/checkout/', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not place order. Please review details.')
      }

      // Checkpoint 7: Place Order gives 201, empties the cart, saves the meetup point, and opens the new order
      await getCart() // Empties cart in state
      navigate(`/orders/${data.id}`, { state: { orderSuccess: true } })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container checkout-empty-wrap">
        <div className="empty-cart-card glass-card">
          <h2>Your Cart is Empty</h2>
          <p>Please add listings to your cart before proceeding to checkout.</p>
          <Link to="/listings" className="btn-primary">
            Browse Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page-container container">
      <Link to="/cart" className="back-link">
        <FaArrowLeft /> Back to Shopping Cart
      </Link>

      <div className="checkout-header">
        <h1 className="checkout-title">Campus Order Checkout</h1>
        <p className="checkout-sub">Confirm your meetup point, address details, and payment method</p>
      </div>

      {errorMsg && (
        <div className="auth-alert error-alert">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left Column: Form Details */}
        <div className="checkout-main-col">
          {/* 1. Meetup Point Selector */}
          <div className="checkout-section-card glass-card">
            <h3 className="section-card-title">
              <FaMapMarkerAlt className="sec-icon" /> 1. Select Campus Meetup Point
            </h3>
            <p className="sec-desc">Choose where you want to meet the seller on campus for handover</p>

            <div className="meetup-options-grid">
              {MEETUP_POINTS.map(mp => (
                <label
                  key={mp.id}
                  className={`meetup-option-card ${meetupPoint === mp.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="meetup_point"
                    value={mp.id}
                    checked={meetupPoint === mp.id}
                    onChange={() => setMeetupPoint(mp.id)}
                  />
                  <div className="meetup-option-content">
                    <span className="meetup-name">{mp.name}</span>
                    <span className="meetup-desc">{mp.desc}</span>
                  </div>
                  {meetupPoint === mp.id && <FaCheckCircle className="checked-icon" />}
                </label>
              ))}
            </div>
          </div>

          {/* 2. Delivery Address (6 Boxes) */}
          <div className="checkout-section-card glass-card">
            <h3 className="section-card-title">
              2. Student Contact & Campus Address
            </h3>
            <p className="sec-desc">Your contact information for the handover meetup</p>

            <div className="address-form-grid">
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={address.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya R or Arjun Kumar"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Hostel Room & Street Address *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={address.address}
                  onChange={handleInputChange}
                  placeholder="Hostel Block, Room No. or Street"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 500001"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="checkout-section-card glass-card">
            <h3 className="section-card-title">
              3. Payment Method
            </h3>

            <div className="payment-options">
              <label className={`payment-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <FaMoneyBillWave className="payment-icon" />
                <div className="payment-content">
                  <strong>Cash at Meetup (COD / UPI)</strong>
                  <span>Inspect the product in person, then hand over cash or scan seller's UPI QR code.</span>
                </div>
              </label>

              <label className={`payment-card ${paymentMethod === 'ONLINE' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                />
                <FaCreditCard className="payment-icon" />
                <div className="payment-content">
                  <strong>Pay Now (Simulated Campus Wallet)</strong>
                  <span>Instant verified confirmation.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card glass-card">
            <h3 className="summary-title">Cart Items ({totalItems})</h3>

            <div className="checkout-items-preview">
              {cartItems.map(item => (
                <div key={item.id} className="preview-row">
                  <div className="preview-info">
                    <span className="preview-title">{item.title}</span>
                    <span className="preview-qty-price">
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="preview-amount">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line">
              <span>Subtotal:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Meetup Delivery:</span>
              <span className="free-delivery-badge">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-line">
              <span>Total Payable:</span>
              <span className="total-val">₹{totalPrice.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className="btn-primary place-order-btn"
              disabled={submitting}
            >
              {submitting ? (
                <PulseLoader size={8} color="#ffffff" />
              ) : (
                <>
                  <FaLock /> Place Order (₹{totalPrice.toFixed(2)})
                </>
              )}
            </button>

            <div className="checkout-assurance">
              <FaShieldAlt />
              <span>CampusMart Buyer Protection Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
