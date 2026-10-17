import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../../api'
import {
  FaDollarSign,
  FaShoppingBag,
  FaBoxOpen,
  FaClock,
  FaChartBar,
  FaExclamationTriangle,
  FaArrowRight,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const SellerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const response = await apiFetch('/api/seller/dashboard/')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Failed to load seller dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="loading-box">
        <PulseLoader size={12} color="#f59e0b" />
        <p>Loading seller analytics & dashboard...</p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="error-card glass-card">
        <h3>Could not load seller analytics</h3>
        <p>Please make sure you are signed in as a seller account.</p>
      </div>
    )
  }

  const { kpis, still_to_handover, seven_day_chart, top_listings, items_by_status } = dashboardData

  // Find max sales for bar scaling
  const maxSales = Math.max(...(seven_day_chart || []).map(d => d.sales), 500)

  return (
    <div className="seller-dashboard-wrap">
      {/* 1. Four Number KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-icon-wrap green">
            <FaDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">₹{kpis.total_sales}</span>
            <span className="kpi-sub">Delivered & active sales</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-wrap blue">
            <FaShoppingBag />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Campus Orders</span>
            <span className="kpi-value">{kpis.total_orders}</span>
            <span className="kpi-sub">Across campus hostels</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-wrap purple">
            <FaBoxOpen />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Listings</span>
            <span className="kpi-value">{kpis.active_listings}</span>
            <span className="kpi-sub">Available for sale</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-icon-wrap amber">
            <FaClock />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Pending Handovers</span>
            <span className="kpi-value">{kpis.pending_handovers}</span>
            <span className="kpi-sub">Items awaiting delivery</span>
          </div>
        </div>
      </div>

      {/* 2. "Still to Hand Over" Strip */}
      <div className="handover-strip-card glass-card">
        <div className="strip-header">
          <div className="strip-title-row">
            <FaTruck className="strip-truck-icon" />
            <div>
              <h3>Still to Hand Over ({still_to_handover?.length || 0})</h3>
              <p>Items ordered by students requiring pickup at campus meetup points</p>
            </div>
          </div>
          <Link to="/seller/orders" className="btn-secondary view-all-handovers-btn">
            Open Order Actions <FaArrowRight />
          </Link>
        </div>

        {(!still_to_handover || still_to_handover.length === 0) ? (
          <div className="all-clear-box">
            <FaCheckCircle className="check-icon" />
            <span>All caught up! No pending handovers waiting.</span>
          </div>
        ) : (
          <div className="handover-items-scroller">
            {still_to_handover.map(item => (
              <div key={item.id} className="handover-chip">
                <div className="chip-badge-status">
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                  <span className="chip-order-ref">Order #{item.order_id}</span>
                </div>
                <h5 className="chip-item-title" title={item.title}>{item.title}</h5>
                <div className="chip-meta">
                  <span>Qty: <strong>{item.quantity}</strong> (₹{item.amount})</span>
                  <span>Meetup: <strong>{item.meetup_point}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Seven-Bar Chart (Check 9: draws seven bars, including days with nothing on them!) */}
      <div className="chart-and-status-row">
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3><FaChartBar /> 7-Day Campus Sales Activity</h3>
            <span className="chart-note">Daily order revenue across the last 7 days</span>
          </div>

          <div className="seven-bar-chart-container">
            {seven_day_chart?.map((bar, index) => {
              const heightPercent = maxSales > 0 ? Math.min(100, Math.max(8, (bar.sales / maxSales) * 100)) : 8
              return (
                <div key={index} className="chart-col">
                  <div className="bar-val-popup">
                    <span>₹{bar.sales.toFixed(0)}</span>
                    <small>{bar.orders_count} orders</small>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${bar.sales > 0 ? 'has-sales' : 'zero-sales'}`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="bar-day-label">{bar.day_name}</span>
                  <span className="bar-date-label">{bar.date.split('-').slice(1).join('/')}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Items-By-Status Panel */}
        <div className="status-breakdown-card glass-card">
          <h3>Items by Delivery Status</h3>
          <p className="panel-sub">Lifecycle progress of all ordered items</p>

          <div className="status-bars-list">
            <div className="status-row">
              <div className="status-row-info">
                <span className="badge badge-placed">Placed</span>
                <span className="status-count">{items_by_status?.placed || 0} items</span>
              </div>
              <div className="status-progress-track">
                <div
                  className="status-fill placed"
                  style={{ width: `${Math.min(100, ((items_by_status?.placed || 0) / 10) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-row">
              <div className="status-row-info">
                <span className="badge badge-shipped">Shipped (En Route)</span>
                <span className="status-count">{items_by_status?.shipped || 0} items</span>
              </div>
              <div className="status-progress-track">
                <div
                  className="status-fill shipped"
                  style={{ width: `${Math.min(100, ((items_by_status?.shipped || 0) / 10) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-row">
              <div className="status-row-info">
                <span className="badge badge-delivered">Delivered (Handed Over)</span>
                <span className="status-count">{items_by_status?.delivered || 0} items</span>
              </div>
              <div className="status-progress-track">
                <div
                  className="status-fill delivered"
                  style={{ width: `${Math.min(100, ((items_by_status?.delivered || 0) / 10) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="status-row">
              <div className="status-row-info">
                <span className="badge badge-cancelled">Cancelled</span>
                <span className="status-count">{items_by_status?.cancelled || 0} items</span>
              </div>
              <div className="status-progress-track">
                <div
                  className="status-fill cancelled"
                  style={{ width: `${Math.min(100, ((items_by_status?.cancelled || 0) / 10) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top Listings Panel */}
      <div className="top-listings-card glass-card">
        <h3>Top Selling Campus Items</h3>
        {(!top_listings || top_listings.length === 0) ? (
          <p className="empty-sub">No sales recorded yet. Once orders are placed, top selling items will appear here.</p>
        ) : (
          <div className="top-listings-table-wrap">
            <table className="top-listings-table">
              <thead>
                <tr>
                  <th>Listing Title</th>
                  <th>Quantity Sold</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {top_listings.map((tl, i) => (
                  <tr key={i}>
                    <td>
                      <span className="rank-num">#{i + 1}</span>
                      <strong className="tl-title">{tl.title}</strong>
                    </td>
                    <td>{tl.total_qty} units</td>
                    <td className="amount-col">₹{tl.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDashboard
