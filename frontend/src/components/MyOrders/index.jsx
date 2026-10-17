import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../api'
import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowRight,
  FaShoppingBag
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await apiFetch('/api/orders/')
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="loading-box container">
        <PulseLoader size={12} color="#6366f1" />
        <p>Retrieving your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page-container container">
        <div className="empty-orders-card glass-card">
          <FaBoxOpen className="empty-icon" />
          <h2>No Orders Placed Yet</h2>
          <p>You haven't ordered any items yet. Browse campus listings to find books, calculators, and essentials.</p>
          <Link to="/listings" className="btn-primary">
            Browse Campus Listings <FaArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page-container container">
      <div className="orders-header">
        <h1 className="orders-title">My Orders ({orders.length})</h1>
        <p className="orders-sub">Track campus handovers, meetup points, and delivery statuses</p>
      </div>

      <div className="orders-list-grid">
        {orders.map(order => {
          const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })

          return (
            <div key={order.id} className="order-card glass-card">
              <div className="order-card-header">
                <div className="order-id-group">
                  <span className="order-label">Order #</span>
                  <span className="order-number">{order.id}</span>
                </div>

                {/* Status Badge: placed, shipped, delivered, cancelled */}
                <span className={`badge badge-${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-meta-row">
                  <span className="meta-item">
                    <FaCalendarAlt /> Placed on {formattedDate}
                  </span>
                  <span className="meta-item">
                    <FaMapMarkerAlt /> Meetup: <strong>{order.meetup_point}</strong>
                  </span>
                </div>

                <div className="order-items-summary">
                  <span className="items-count">
                    {order.items_count} {order.items_count === 1 ? 'item' : 'items'} in order:
                  </span>
                  <p className="items-preview-names">
                    {(order.items || []).map(i => i.title).join(', ')}
                  </p>
                </div>
              </div>

              <div className="order-card-footer">
                <div className="order-total-block">
                  <span className="total-label">Order Total:</span>
                  <span className="total-amount">₹{order.total_price}</span>
                </div>

                <Link to={`/orders/${order.id}`} className="btn-secondary view-details-btn">
                  View Details <FaArrowRight />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyOrders
