import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowRight,
  FaShoppingBag,
  FaShieldAlt,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { formatCurrency } from '../../format'
import './index.css'

const Cart = () => {
  const { cartItems, totalItems, totalPrice, updateCartItem, removeCartItem, loading } = useCart()
  const { isAuthenticated } = useUser()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="cart-page-container container">
        <div className="empty-cart-card glass-card">
          <FaShoppingBag className="empty-cart-icon" />
          <h2>Please Log In to View Your Cart</h2>
          <p>Sign in with your campus account to manage saved cart items and proceed to checkout.</p>
          <Link to="/login" className="btn-primary" state={{ from: { pathname: '/cart' } }}>
            Sign In Now
          </Link>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container container">
        <div className="empty-cart-card glass-card">
          <FaShoppingBag className="empty-cart-icon" />
          <h2>Your CampusMart Cart is Empty</h2>
          <p>Looks like you haven't added any textbooks, electronics, or campus essentials yet.</p>
          <Link to="/listings" className="btn-primary">
            Explore Available Listings <FaArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page-container container">
      <div className="cart-header">
        <h1 className="cart-page-title">Campus Shopping Cart</h1>
        <span className="cart-count-pill">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cart-grid">
        {/* Cart Item Rows */}
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item-row glass-card">
              <img src={item.imageUrl} alt={item.title} className="cart-item-img" />

              <div className="cart-item-details">
                <Link to={`/listings/${item.listingId}`} className="cart-item-title">
                  {item.title}
                </Link>
                <div className="cart-item-meta">
                  <span className="badge badge-condition">{item.condition}</span>
                  {item.hostel && (
                    <span className="cart-item-hostel">
                      <FaMapMarkerAlt /> {item.hostel}
                    </span>
                  )}
                </div>
                <div className="cart-item-unit-price">
                  ₹{item.price.toFixed(2)} each
                </div>
              </div>

              {/* Quantity Selector: plus and minus */}
              <div className="cart-qty-controls">
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                  title="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span className="cart-qty-val">{item.quantity}</span>
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => updateCartItem(item.id, item.quantity + 1)}
                  title="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>

              {/* Subtotal for this item */}
              <div className="cart-item-subtotal">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>

              {/* Remove button */}
              <button
                type="button"
                className="cart-remove-btn"
                onClick={() => removeCartItem(item.id)}
                title="Remove from cart"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Button */}
        <div className="cart-summary-box glass-card">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-line">
            <span>Subtotal ({totalItems} items):</span>
            <span className="summary-amount">₹{totalPrice.toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>Campus Meetup Delivery:</span>
            <span className="free-delivery-badge">FREE</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total-line">
            <span>Total Payable:</span>
            <span className="total-val">₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary checkout-btn"
          >
            Proceed to Checkout <FaArrowRight />
          </button>

          <div className="summary-safety-note">
            <FaShieldAlt />
            <span>Pay only when you meet the seller and inspect the item in person.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
