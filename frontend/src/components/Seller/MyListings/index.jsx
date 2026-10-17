import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../../api'
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaTag,
  FaCheckCircle
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const MyListings = () => {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchSellerListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (submittedSearch.trim()) {
        params.set('search', submittedSearch.trim())
      }

      // Calls GET /api/seller/listings/
      const response = await apiFetch(`/api/seller/listings/?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.results || [])
        setCount(data.count || 0)
        setTotalPages(data.total_pages || 1)
      } else {
        setListings([])
      }
    } catch (err) {
      console.error('Error fetching seller listings:', err)
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [page, submittedSearch])

  useEffect(() => {
    fetchSellerListings()
  }, [fetchSellerListings])

  const handleSearchSubmit = e => {
    e.preventDefault()
    setSubmittedSearch(search)
    setPage(1)
  }

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      // Calls DELETE /api/seller/listings/<id>/
      const response = await apiFetch(`/api/seller/listings/${id}/`, {
        method: 'DELETE'
      })

      // DELETE answers 204 with no body
      if (response.status === 204 || response.ok) {
        setListings(prev => prev.filter(item => item.id !== id))
        setCount(c => Math.max(0, c - 1))
      } else if (response.status === 403) {
        alert("You do not have permission to delete somebody else's listing (403 Forbidden).")
      } else {
        alert('Could not delete listing.')
      }
    } catch (err) {
      alert('Delete failed.')
    }
  }

  return (
    <div className="my-listings-wrap">
      {/* Top Toolbar */}
      <div className="my-listings-toolbar glass-card">
        <form onSubmit={handleSearchSubmit} className="seller-search-form">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        <Link to="/seller/listings/new" className="btn-primary add-listing-btn">
          <FaPlus /> Add New Listing
        </Link>
      </div>

      <div className="listings-summary-row">
        <span>Managing <strong>{count}</strong> listings</span>
      </div>

      {/* Table / Rows of Listings */}
      {loading ? (
        <div className="loading-box">
          <PulseLoader size={12} color="#f59e0b" />
          <p>Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-catalog glass-card">
          <h3>No listings found</h3>
          <p>You haven't listed any items or no results matched your search.</p>
          <Link to="/seller/listings/new" className="btn-primary">
            <FaPlus /> Post Your First Campus Listing
          </Link>
        </div>
      ) : (
        <div className="seller-listings-table-wrap glass-card">
          <table className="seller-listings-table">
            <thead>
              <tr>
                <th>Item Image</th>
                <th>Listing Details</th>
                <th>Category</th>
                <th>Hostel</th>
                <th>Condition</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(item => (
                <tr key={item.id}>
                  {/* Note: Server renames to image_url on the way out! */}
                  <td className="img-td">
                    <img
                      src={item.image_url || item.imageUrl}
                      alt={item.title}
                      className="seller-item-thumb"
                    />
                  </td>
                  <td>
                    <strong className="item-tbl-title">{item.title}</strong>
                    <div className="tbl-meta-sub">
                      {item.is_senior_deal && (
                        <span className="badge badge-senior">🎓 Senior Deal</span>
                      )}
                      {item.negotiable && (
                        <span className="badge badge-negotiable">Negotiable</span>
                      )}
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.hostel}</td>
                  <td>
                    <span className="badge badge-condition">{item.condition}</span>
                  </td>
                  <td className="price-td">₹{item.price}</td>
                  <td>
                    <span className={`badge ${item.availability === 'Available' ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {item.availability}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions-group">
                      <Link
                        to={`/seller/listings/${item.id}/edit`}
                        className="tbl-action-btn edit"
                        title="Edit listing"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="tbl-action-btn delete"
                        title="Delete listing"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-bar glass-card">
          <button
            className="page-btn prev"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <FaChevronLeft /> Previous
          </button>
          <span className="page-indicator">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="page-btn next"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  )
}

export default MyListings
