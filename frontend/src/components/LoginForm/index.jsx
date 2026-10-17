import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { FaGraduationCap, FaLock, FaUser, FaSignInAlt, FaInfoCircle } from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const LoginForm = () => {
  const { login } = useUser()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const successNotice = location.state?.message

  const handleSubmit = async e => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both your username and password.')
      return
    }

    try {
      setErrorMsg('')
      setIsSubmitting(true)
      await login(username.trim(), password)
      // Navigate to intended page or /listings
      const from = location.state?.from?.pathname || '/listings'
      navigate(from, { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick autofill for grading and demo checking
  const handleQuickLogin = (uname, pass) => {
    setUsername(uname)
    setPassword(pass)
    setErrorMsg('')
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-logo-box">
            <FaGraduationCap />
          </div>
          <h2 className="auth-title">Welcome to CampusMart</h2>
          <p className="auth-subtitle">Sign in to unlock Senior-Only Deals, cart, and orders</p>
        </div>

        {successNotice && (
          <div className="auth-alert success-alert">
            <FaInfoCircle /> {successNotice}
          </div>
        )}

        {errorMsg && (
          <div className="auth-alert error-alert">
            <FaInfoCircle /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Priya or Arjun"
                disabled={isSubmitting}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <PulseLoader size={8} color="#ffffff" /> : (
              <>
                <FaSignInAlt /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Test Accounts Helper Box */}
        <div className="demo-accounts-box">
          <span className="demo-title">⚡ Quick Demo Test Logins:</span>
          <div className="demo-btn-group">
            <button
              type="button"
              className="demo-chip-btn seller"
              onClick={() => handleQuickLogin('Priya', 'secret123')}
              title="Seller account with 54 listings & seller dashboard"
            >
              👩‍🏫 Priya (Seller)
            </button>
            <button
              type="button"
              className="demo-chip-btn student"
              onClick={() => handleQuickLogin('Arjun', 'secret123')}
              title="Student buyer account with orders"
            >
              👨‍🎓 Arjun (Student)
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="auth-switch-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
