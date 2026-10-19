import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../../../api'
import {
  FaArrowLeft,
  FaSave,
  FaTag,
  FaImage,
  FaBuilding,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const CATEGORIES = ['Books', 'Electronics', 'Hostel Essentials', 'Cycles', 'Sports']
const HOSTELS = ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D']
const CONDITIONS = ['Like New', 'Good', 'Fair']
const BRANCHES = [
  { value: 'General', label: 'General Campus Life' },
  { value: 'Common', label: 'Common 1st Year' },
  { value: 'CSE', label: 'Computer Science (CSE)' },
  { value: 'ECE', label: 'Electronics & Comm (ECE)' },
  { value: 'MECH', label: 'Mechanical Eng (MECH)' },
  { value: 'EEE', label: 'Electrical Eng (EEE)' },
  { value: 'CIVIL', label: 'Civil Eng (CIVIL)' },
]

const ProductForm = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    hostel: 'Hostel C',
    condition: 'Good',
    negotiable: false,
    category: 'Books',
    price: '',
    image_url: 'https://picsum.photos/seed/listingnew/400/400',
    availability: 'Available',
    is_senior_deal: false,
    branch: 'General',
    semester: 1,
    subject_code: '',
    author: '',
    description: ''
  })

  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')


  useEffect(() => {
    if (!isEditMode) return

    const fetchListing = async () => {
      setLoading(true)
      try {
        const response = await apiFetch(`/api/seller/listings/${id}/`)
        if (response.status === 403) {
          setErrorMsg("You do not have permission to edit somebody else's listing (403 Forbidden).")
          return
        }
        if (!response.ok) {
          setErrorMsg('Listing not found.')
          return
        }
        const data = await response.json()
        setFormData({
          title: data.title || '',
          hostel: data.hostel || 'Hostel C',
          condition: data.condition || 'Good',
          negotiable: Boolean(data.negotiable),
          category: data.category || 'Books',
          price: data.price || '',
          image_url: data.image_url || data.imageUrl || '',
          availability: data.availability || 'Available',
          is_senior_deal: Boolean(data.is_senior_deal),
          branch: data.branch || 'General',
          semester: data.semester || 1,
          subject_code: data.subject_code || '',
          author: data.author || '',
          description: data.description || ''
        })
      } catch (err) {
        setErrorMsg('Error loading listing details.')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id, isEditMode])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.title.trim()) {
      setErrorMsg('Please enter a listing title.')
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMsg('Please enter a valid price.')
      return
    }

    try {
      setSubmitting(true)
      const url = isEditMode
        ? `/api/seller/listings/${id}/`
        : '/api/seller/listings/'
      const method = isEditMode ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        imageUrl: formData.image_url
      }

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      })

      if (response.status === 403) {
        setErrorMsg("Permission Denied: You cannot modify somebody else's listing (403 Forbidden).")
        return
      }

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Could not save listing.')
      }

      navigate('/seller/listings')
    } catch (err) {
      setErrorMsg(err.message || 'Error saving listing.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-box">
        <PulseLoader size={12} color="#f59e0b" />
        <p>Loading listing details...</p>
      </div>
    )
  }

  return (
    <div className="product-form-wrap glass-card">
      <div className="form-head">
        <Link to="/seller/listings" className="back-link">
          <FaArrowLeft /> Back to My Listings
        </Link>
        <h2>{isEditMode ? 'Edit Campus Listing' : 'Post New Campus Listing'}</h2>
        <p>Provide accurate condition and hostel details so buyers know where to meet you.</p>
      </div>

      {errorMsg && (
        <div className="auth-alert error-alert">
          <FaInfoCircle /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="listing-editor-form">
        <div className="form-grid">
          {/* Title */}
          <div className="form-group full-width">
            <label htmlFor="title">Listing Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Casio Scientific Calculator or Engineering Mechanics"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Hostel */}
          <div className="form-group">
            <label htmlFor="hostel">Hostel Location *</label>
            <select
              id="hostel"
              name="hostel"
              value={formData.hostel}
              onChange={handleChange}
            >
              {HOSTELS.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="price">Asking Price (₹) *</label>
            <input
              id="price"
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 450.00"
              required
            />
          </div>

          {/* Condition */}
          <div className="form-group">
            <label htmlFor="condition">Product Condition *</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="form-group full-width">
            <label htmlFor="image_url">Image Address (URL) *</label>
            <input
              id="image_url"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://picsum.photos/seed/.../400/400"
              required
            />
          </div>

          {/* Availability */}
          <div className="form-group">
            <label htmlFor="availability">Availability Status *</label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          {/* Academic Branch */}
          <div className="form-group">
            <label htmlFor="branch">Engineering Branch</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            >
              {BRANCHES.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="form-group">
            <label htmlFor="semester">Target Semester</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Subject Code */}
          <div className="form-group">
            <label htmlFor="subject_code">Subject / Course Code</label>
            <input
              id="subject_code"
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              placeholder="e.g. CS201, MA101, EC302"
            />
          </div>

          {/* Book Author / Manufacturer */}
          <div className="form-group">
            <label htmlFor="author">Author / Brand / Model</label>
            <input
              id="author"
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Cormen, Casio, Hero"
            />
          </div>


          {/* Checkboxes Row */}
          <div className="form-group checkboxes-block full-width">
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
              />
              <span>Price Negotiable (tag shown to students)</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                name="is_senior_deal"
                checked={formData.is_senior_deal}
                onChange={handleChange}
              />
              <span>🎓 Senior-Only Deal (exclusive clearance deal for signed-in members)</span>
            </label>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description">Description & Notes</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe condition, edition year, accessories included, and pickup availability..."
            ></textarea>
          </div>
        </div>

        <div className="form-submit-row">
          <Link to="/seller/listings" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <PulseLoader size={8} color="#ffffff" />
            ) : (
              <>
                <FaSave /> {isEditMode ? 'Update Listing' : 'Publish Listing'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm
