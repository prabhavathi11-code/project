import React, { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { apiFetch } from '../../api'
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaShieldAlt,
  FaMoneyBillWave,
  FaUser,
  FaPhoneAlt,
  FaHome
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const OrderDetails = () => {
  const { id } = useParams()
  const location = useLocation()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const isNewOrder = location.state?.orderSuccess

  const fetchOrder = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await apiFetch(`/api/orders/${id}/`)
      if (response.status === 404) {
        setErrorMsg('No such order found or you do not have permission to view this order.')
        setOrder(null)
        return
      }
      if (!response.ok) {
        setErrorMsg('Error retrieving order details.')
        setOrder(null)
        return
      }
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      console.error('Order fetch error:', err)
      setErrorMsg('Network error while retrieving order.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      setCancelling(true)
      const response = await apiFetch(`/api/orders/${id}/cancel/`, {
        method: 'POST'
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.detail || 'Could not cancel order.')
      } else {
        setOrder(data)
      }
    } catch (err) {
      alert('Error cancelling order.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-box container">
        <PulseLoader size={12} color="#6366f1" />
        <p>Loading order #{id}...</p>
      </div>
    )
  }

  if (errorMsg || !order) {
    return (
      <div className="container order-details-page">
        <div className="error-card glass-card">
          <h2>Order Not Found (404)</h2>
          <p>{errorMsg || 'The requested order could not be located.'}</p>
          <Link to="/orders" className="btn-primary">
            <FaArrowLeft /> Return to My Orders
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  const addr = order.address || {}

  return (
    <div className="order-details-page container">
      <Link to="/orders" className="back-link">
        <FaArrowLeft /> Back to My Orders
      </Link>

      {isNewOrder && (
        <div className="order-success-banner glass-card">
          <FaCheckCircle className="success-icon" />
          <div>
            <h3>Order Placed Successfully! (201 Created)</h3>
            <p>Your order #{order.id} has been recorded. The seller has been notified to meet you at {order.meetup_point}.</p>
          </div>
        </div>
      )}

      {/* Header with Order Status */}
      <div className="order-view-header glass-card">
        <div className="order-title-block">
          <span className="order-meta-tag">Order #{order.id}</span>
          <h1>Campus Handover Order</h1>
          <span className="order-date-text">
            <FaCalendarAlt /> Placed on {formattedDate}
          </span>
        </div>

        <div className="order-status-block">
          <span className={`badge badge-${order.status} big-status-badge`}>
            Status: {order.status}
          </span>
          <span className="payment-pill">
            {order.payment_method} {order.is_paid ? '• Paid' : '• Payment Pending at Meetup'}
          </span>
        </div>
      </div>

      <div className="order-details-layout">
        {/* Left Column: Copied Listings Items */}
        <div className="order-items-column">
          <div className="glass-card section-box">
            <h3 className="section-title">Purchased Items ({order.items?.length || 0})</h3>
            <p className="section-note">
              Listing details (title, condition, picture, and price) are copied into this order record so they remain permanent even if the seller updates or removes the original listing.
            </p>

            <div className="order-items-list">
              {(order.items || []).map(item => (
                <div key={item.id} className="order-item-card">
                  <img src={item.imageUrl} alt={item.title} className="order-item-thumb" />

                  <div className="order-item-info">
                    <h4 className="item-title">{item.title}</h4>
                    <div className="item-meta-badges">
                      <span className="badge badge-condition">{item.condition}</span>
                      <span className="item-hostel">Seller Hostel: {item.hostel}</span>
                      <span className="seller-name">Seller: @{item.seller_username}</span>
                    </div>

                    <div className="item-qty-row">
                      <span>Qty: <strong>{item.quantity}</strong> × ₹{item.price}</span>
                      <span className="item-total-badge">Subtotal: ₹{item.item_total}</span>
                    </div>
                  </div>

                  <div className="item-status-col">
                    <span className={`badge badge-${item.status}`}>
                      {item.status}
                    </span>
                    <span className="status-hint">
                      {item.status === 'placed' && 'Awaiting seller departure'}
                      {item.status === 'shipped' && 'Seller is on the way!'}
                      {item.status === 'delivered' && 'Handed over'}
                      {item.status === 'cancelled' && 'Item cancelled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meetup & Contact Details */}
        <div className="order-sidebar-column">
          {/* Meetup Point Card */}
          <div className="glass-card section-box">
            <h3 className="section-title">
              <FaMapMarkerAlt className="icon-gold" /> Campus Meetup Point
            </h3>
            <div className="meetup-highlight-box">
              <span className="meetup-name">{order.meetup_point}</span>
              <p className="meetup-explanation">
                The seller will bring the purchased items to this campus landmark. Please be present with Cash or UPI ready.
              </p>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="glass-card section-box">
            <h3 className="section-title">
              <FaHome className="icon-blue" /> Buyer Contact & Room
            </h3>
            <div className="address-display-list">
              <div className="addr-row">
                <FaUser className="addr-icon" />
                <span>{addr.full_name || order.buyer_username}</span>
              </div>
              <div className="addr-row">
                <FaPhoneAlt className="addr-icon" />
                <span>{addr.phone || 'N/A'}</span>
              </div>
              <div className="addr-row">
                <FaHome className="addr-icon" />
                <span>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</span>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="glass-card section-box">
            <h3 className="section-title">Order Total</h3>
            <div className="summary-line">
              <span>Total Amount:</span>
              <span className="summary-total-amt">₹{order.total_price}</span>
            </div>
            <div className="summary-line">
              <span>Payment Mode:</span>
              <span>{order.payment_method === 'COD' ? 'Cash on Delivery (Meetup)' : 'Online Paid'}</span>
            </div>

            {/* Cancel Button when can_cancel is true */}
            {order.can_cancel && (
              <button
                onClick={handleCancelOrder}
                className="cancel-order-btn"
                disabled={cancelling}
              >
                {cancelling ? <PulseLoader size={8} color="#ef4444" /> : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
