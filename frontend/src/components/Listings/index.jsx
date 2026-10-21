import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, getAccessToken } from '../../api'
import { useUser } from '../../context/UserContext'
import { useCart } from '../../context/CartContext'
import {
  FaSearch,
  FaTag,
  FaStar,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaShoppingCart,
  FaCheckCircle,
  FaSlidersH,
  FaTimes
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import { handleImageError } from '../../utils/imageFallback'
import './index.css'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Hostel Essentials', 'Cycles', 'Sports']
const HOSTELS = ['All', 'Hostel A', 'Hostel B', 'Hostel C', 'Hostel D']
const BRANCHES = ['All', 'Common', 'CSE', 'ECE', 'MECH', 'EEE', 'CIVIL']
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8']
const RATINGS = [
  { label: 'All Ratings', value: '' },
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' }
]

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useUser()
  const { addToCart } = useCart()

  // Senior Deals State
  const [seniorDeals, setSeniorDeals] = useState([])
  const [seniorDealsError, setSeniorDealsError] = useState(null)
  const [loadingSenior, setLoadingSenior] = useState(true)

  // Listing Catalog State
  const [listings, setListings] = useState([])
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingListings, setLoadingListings] = useState(true)

  // Query State
  const initialCategory = searchParams.get('category') || 'All'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedHostel, setSelectedHostel] = useState('All')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedSemester, setSelectedSemester] = useState('All')
  const [selectedRating, setSelectedRating] = useState('')
  const [ordering, setOrdering] = useState('')

  // Split Search Box: "what is being typed" vs "what was submitted"
  // Typing sends NO requests; pressing Enter or clicking Search sends exactly one request!
  const [typedSearch, setTypedSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')

  // Page State
  const [page, setPage] = useState(1)


  // Adding to cart animation feedback
  const [addedIds, setAddedIds] = useState({})

  // Fetch Senior-Only Deals
  const fetchSeniorDeals = useCallback(async () => {
    setLoadingSenior(true)
    setSeniorDealsError(null)

    try {
      // Calls /api/listings/?is_senior_deal=true&page_size=6
      const response = await apiFetch('/api/listings/?is_senior_deal=true&page_size=6')
      if (response.ok) {
        const data = await response.json()
        setSeniorDeals(data.results || [])
      } else {
        // Not logged in or broken token answers 401
        setSeniorDeals([])
        setSeniorDealsError(response.status === 401 ? 'unauthorized' : 'error')
      }
    } catch (err) {
      setSeniorDeals([])
      setSeniorDealsError('error')
    } finally {
      setLoadingSenior(false)
    }
  }, [])

  useEffect(() => {
    fetchSeniorDeals()
  }, [fetchSeniorDeals, isAuthenticated])

  // Fetch Standard Listings
  const fetchListings = useCallback(async () => {
    setLoadingListings(true)

    // Build query params
    const params = new URLSearchParams()
    params.set('page', page.toString())

    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory)
    }
    if (selectedHostel && selectedHostel !== 'All') {
      params.set('hostel', selectedHostel)
    }
    if (selectedBranch && selectedBranch !== 'All') {
      params.set('branch', selectedBranch)
    }
    if (selectedSemester && selectedSemester !== 'All') {
      params.set('semester', selectedSemester)
    }
    if (selectedRating) {
      params.set('rating', selectedRating)
    }
    if (ordering) {
      params.set('ordering', ordering)
    }
    if (submittedSearch.trim()) {
      params.set('search', submittedSearch.trim())
    }

    try {
      const response = await apiFetch(`/api/listings/?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setListings(data.results || [])
        setCount(data.count || 0)
        setTotalPages(data.total_pages || 1)
      } else {
        setListings([])
      }
    } catch (err) {
      console.error('Error fetching listings:', err)
      setListings([])
    } finally {
      setLoadingListings(false)
    }
  }, [page, selectedCategory, selectedHostel, selectedBranch, selectedSemester, selectedRating, ordering, submittedSearch])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Search input handlers
  const handleSearchKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSubmittedSearch(typedSearch)
      setPage(1)
    }
  }

  const handleSearchSubmit = e => {
    e.preventDefault()
    setSubmittedSearch(typedSearch)
    setPage(1)
  }

  const handleCategorySelect = cat => {
    setSelectedCategory(cat)
    setPage(1)
  }

  const handleAddToCart = async (listing, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(listing.id, 1)
      setAddedIds(prev => ({ ...prev, [listing.id]: true }))
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [listing.id]: false }))
      }, 1500)
    } catch (err) {
      alert(err.message || 'Please log in to add items to cart.')
    }
  }

  return (
    <div className="listings-page-container container">
      {/* 1. Senior-Only Deals Strip at the top */}
      <section className="senior-deals-strip">
        <div className="senior-strip-header">
          <div className="senior-title-box">
            <span className="senior-icon">🎓</span>
            <div>
              <h2 className="senior-heading">Senior-Only Deals</h2>
              <p className="senior-sub">Final-year students clear their rooms before graduation with special discounts</p>
            </div>
          </div>
        </div>

        {loadingSenior ? (
          <div className="strip-loading">
            <PulseLoader size={8} color="#f59e0b" />
          </div>
        ) : seniorDealsError === 'unauthorized' || !isAuthenticated ? (
          // Log-in banner for anonymous visitors
          <div className="senior-login-banner glass-card">
            <div className="lock-icon-circle">
              <FaLock />
            </div>
            <div className="banner-text">
              <h3>Member-Only Clearance Deals</h3>
              <p>Senior deals are reserved exclusively for registered campus accounts. Sign in to view and claim these bargains.</p>
            </div>
            <Link to="/login" className="btn-primary banner-login-btn">
              Sign In to Unlock
            </Link>
          </div>
        ) : (
          // 6 Senior Deals Cards Carousel
          <div className="senior-deals-carousel">
            {seniorDeals.map(deal => (
              <Link to={`/listings/${deal.id}`} key={deal.id} className="senior-deal-card glass-card">
                <div className="senior-img-wrap">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    loading="lazy"
                    onError={e => handleImageError(e, deal.category)}
                  />
                  <span className="badge badge-senior">Senior Deal</span>
                </div>
                <div className="senior-card-body">
                  <h4 className="deal-title" title={deal.title}>{deal.title}</h4>
                  <div className="deal-meta">
                    <span className="deal-hostel">{deal.hostel}</span>
                    <span className="deal-condition">{deal.condition}</span>
                  </div>
                  <div className="deal-price-row">
                    <span className="deal-price">₹{deal.price}</span>
                    <button
                      className="deal-cart-btn"
                      onClick={e => handleAddToCart(deal, e)}
                      title="Add to cart"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Main Catalog Section */}
      <div className="catalog-layout">
        {/* Filter Sidebar */}
        <aside className="filters-sidebar glass-card">
          <div className="filters-header">
            <h3><FaSlidersH /> Filters</h3>
            {(selectedCategory !== 'All' || selectedHostel !== 'All' || selectedBranch !== 'All' || selectedSemester !== 'All' || selectedRating || submittedSearch) && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedHostel('All')
                  setSelectedBranch('All')
                  setSelectedSemester('All')
                  setSelectedRating('')
                  setTypedSearch('')
                  setSubmittedSearch('')
                  setPage(1)
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Academic Branch Filter */}
          <div className="filter-group">
            <label className="filter-title">
              <FaGraduationCap style={{ marginRight: '6px', color: 'var(--primary)' }} />
              Academic Branch
            </label>
            <div className="category-pills">
              {BRANCHES.map(b => (
                <button
                  key={b}
                  className={`cat-pill ${selectedBranch === b ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedBranch(b)
                    setPage(1)
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Semester Filter */}
          <div className="filter-group">
            <label className="filter-title">Target Semester</label>
            <div className="semester-grid">
              {SEMESTERS.map(sem => (
                <button
                  key={sem}
                  className={`sem-pill ${selectedSemester === sem ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSemester(sem)
                    setPage(1)
                  }}
                >
                  {sem === 'All' ? 'All' : `Sem ${sem}`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-title">Category</label>
            <div className="category-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Hostel Filter */}
          <div className="filter-group">
            <label className="filter-title">Hostel Location</label>
            <div className="hostel-radios">
              {HOSTELS.map(h => (
                <label key={h} className="radio-label">
                  <input
                    type="radio"
                    name="hostel"
                    checked={selectedHostel === h}
                    onChange={() => {
                      setSelectedHostel(h)
                      setPage(1)
                    }}
                  />
                  <span>{h}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <label className="filter-title">Minimum Rating</label>
            <div className="rating-buttons">
              {RATINGS.map(r => (
                <button
                  key={r.value}
                  className={`rating-btn ${selectedRating === r.value ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRating(r.value)
                    setPage(1)
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings Display Area */}
        <main className="catalog-main">
          {/* Top Search & Sort Controls */}
          <div className="catalog-toolbar glass-card">
            {/* Search Input: Separated Typing vs Enter/Submit */}
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrap">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search listings or hostel (Press Enter)..."
                  value={typedSearch}
                  onChange={e => setTypedSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                {typedSearch && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => {
                      setTypedSearch('')
                      setSubmittedSearch('')
                      setPage(1)
                    }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-secondary search-btn">
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div className="sort-box">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={ordering}
                onChange={e => {
                  setOrdering(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Default Order</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Highest Rated</option>
                <option value="-created_at">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Results Count & Active Filters Indicator */}
          <div className="results-status-row">
            <span className="results-count">
              Showing <strong>{listings.length}</strong> of <strong>{count}</strong> campus listings
            </span>
            <div className="active-filters-list">
              {submittedSearch && (
                <span className="active-filter-badge">
                  Search: "{submittedSearch}"
                  <FaTimes onClick={() => { setTypedSearch(''); setSubmittedSearch(''); setPage(1); }} />
                </span>
              )}
              {selectedBranch !== 'All' && (
                <span className="active-filter-badge branch-filter-badge">
                  Branch: {selectedBranch}
                  <FaTimes onClick={() => { setSelectedBranch('All'); setPage(1); }} />
                </span>
              )}
              {selectedSemester !== 'All' && (
                <span className="active-filter-badge sem-filter-badge">
                  Semester: {selectedSemester}
                  <FaTimes onClick={() => { setSelectedSemester('All'); setPage(1); }} />
                </span>
              )}
            </div>
          </div>

          {/* Listings Grid */}
          {loadingListings ? (
            <div className="loading-box">
              <PulseLoader size={12} color="#6366f1" />
              <p>Fetching campus listings from server...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="empty-catalog glass-card">
              <div className="empty-icon">📦</div>
              <h3>No Listings Found</h3>
              <p>
                {selectedCategory === 'Sports'
                  ? 'Sports currently has zero listings on campus. Check back later as students add new sports gear!'
                  : 'Try clearing your filters or searching for something else.'}
              </p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedHostel('All')
                  setSelectedBranch('All')
                  setSelectedSemester('All')
                  setSelectedRating('')
                  setTypedSearch('')
                  setSubmittedSearch('')
                  setPage(1)
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map(item => (
                <Link to={`/listings/${item.id}`} key={item.id} className="listing-card glass-card">
                  <div className="card-media">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      onError={e => handleImageError(e, item.category)}
                    />
                    <div className="card-overlay-badges">
                      <span className="badge badge-condition">{item.condition}</span>
                      {item.negotiable && <span className="badge badge-negotiable">Negotiable</span>}
                      {item.is_senior_deal && <span className="badge badge-senior">Senior Deal</span>}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="card-top-meta">
                      <span className="card-category">{item.category}</span>
                      <span className="card-hostel">{item.hostel}</span>
                    </div>

                    <h3 className="card-title" title={item.title}>
                      {item.title}
                    </h3>

                    {/* Academic Subject / Author info if available */}
                    {(item.author || (item.branch && item.branch !== 'General') || item.subject_code) && (
                      <div className="card-academic-row">
                        {item.branch && item.branch !== 'General' && (
                          <span className="badge badge-branch">
                            <FaGraduationCap /> {item.branch} • Sem {item.semester}
                          </span>
                        )}
                        {item.subject_code && (
                          <span className="badge badge-subcode">{item.subject_code}</span>
                        )}
                        {item.author && (
                          <span className="card-author" title={item.author}>By {item.author}</span>
                        )}
                      </div>
                    )}

                    <div className="card-rating-row">
                      <div className="rating-pill">
                        <FaStar className="star-icon" />
                        <span>{item.rating}</span>
                      </div>
                      <span className="reviews-count">({item.total_reviews} reviews)</span>
                    </div>

                    <div className="card-footer">
                      <div className="price-block">
                        <span className="currency-symbol">₹</span>
                        <span className="price-val">{item.price}</span>
                      </div>

                      <button
                        className={`add-cart-action-btn ${addedIds[item.id] ? 'added' : ''}`}
                        onClick={e => handleAddToCart(item, e)}
                        title="Quick Add to Cart"
                      >
                        {addedIds[item.id] ? (
                          <>
                            <FaCheckCircle /> Added
                          </>
                        ) : (
                          <>
                            <FaShoppingCart /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-bar glass-card">
              <button
                className="page-btn prev"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
              >
                <FaChevronLeft /> Previous
              </button>

              <span className="page-indicator">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>

              <button
                className="page-btn next"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Listings
