import React, { useState, useEffect } from 'react'
import { apiFetch } from '../../../api'
import {
  FaTruck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const SellerOrders = () => {
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchSellerOrders = async () => {
    setLoading(true)
    try {
      // Calls GET /api/seller/orders/
      const response = await apiFetch('/api/seller/orders/')
      if (response.ok) {
        const data = await response.json()
        setOrderItems(data)
      }
    } catch (err) {
      console.error('Error fetching seller orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSellerOrders()
  }, [])

  const handleAdvanceStatus = async (item, nextStatus) => {
    setUpdatingId(item.id)
    try {
      // Calls PATCH /api/seller/orders/<id>/status/
      const response = await apiFetch(`/api/seller/orders/${item.id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      })

      if (response.ok) {
        const updated = await response.json()
        setOrderItems(prev =>
          prev.map(row => (row.id === item.id ? updated : row))
        )
      } else {
        alert('Could not update status.')
      }
    } catch (err) {
      alert('Status update failed.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-box">
        <PulseLoader size={12} color="#f59e0b" />
        <p>Loading items to hand over...</p>
      </div>
    )
  }

  return (
    <div className="seller-orders-wrap">
      <div className="seller-orders-header glass-card">
        <div>
          <h2>Campus Handover Queue ({orderItems.length})</h2>
          <p>
            When you leave your hostel with the product, click <strong>"Mark as Shipped"</strong> to alert the student you are on your way. 
            Once handed over at the meetup point, click <strong>"Mark as Delivered"</strong>.
          </p>
        </div>
      </div>

      {orderItems.length === 0 ? (
        <div className="empty-catalog glass-card">
          <FaCheckCircle className="check-icon" style={{ fontSize: '2.5rem', color: '#10b981' }} />
          <h3>No Sold Items Pending</h3>
          <p>When students buy your listings, each row will appear here with student contact and meetup details.</p>
        </div>
      ) : (
        <div className="seller-orders-table-wrap glass-card">
          <table className="seller-orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Item Sold</th>
                <th>Meetup Point & Buyer</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Handover Action</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="order-badge-pill">#{item.order_id}</span>
                  </td>
                  <td>
                    <strong className="item-title-sold">{item.title}</strong>
                    <div className="item-sub-info">
                      <span className="badge badge-condition">{item.condition}</span>
                      <span>From: {item.hostel}</span>
                    </div>
                  </td>
                  <td>
                    <div className="buyer-meetup-cell">
                      <div className="meetup-row">
                        <FaMapMarkerAlt className="gold-pin" />
                        <strong>{item.meetup_point}</strong>
                      </div>
                      <div className="buyer-contact-row">
                        <span><FaUser /> {item.buyer_name}</span>
                        <span><FaPhoneAlt /> {item.buyer_phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td className="amount-cell">₹{item.amount}</td>
                  <td>
                    <span className={`badge badge-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.status === 'placed' && (
                      <button
                        className="btn-status-action ship-btn"
                        onClick={() => handleAdvanceStatus(item, 'shipped')}
                        disabled={updatingId === item.id}
                      >
                        {updatingId === item.id ? (
                          <PulseLoader size={6} color="#000000" />
                        ) : (
                          <>
                            <FaTruck /> On the Way (Ship)
                          </>
                        )}
                      </button>
                    )}

                    {item.status === 'shipped' && (
                      <button
                        className="btn-status-action deliver-btn"
                        onClick={() => handleAdvanceStatus(item, 'delivered')}
                        disabled={updatingId === item.id}
                      >
                        {updatingId === item.id ? (
                          <PulseLoader size={6} color="#ffffff" />
                        ) : (
                          <>
                            <FaCheckCircle /> Handed Over (Deliver)
                          </>
                        )}
                      </button>
                    )}

                    {item.status === 'delivered' && (
                      <span className="delivered-badge-label">
                        <FaCheckCircle /> Complete
                      </span>
                    )}

                    {item.status === 'cancelled' && (
                      <span className="cancelled-label">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SellerOrders
