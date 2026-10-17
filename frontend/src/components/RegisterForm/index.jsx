import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import {
  FaGraduationCap,
  FaLock,
  FaUser,
  FaEnvelope,
  FaUserPlus,
  FaInfoCircle,
  FaStore
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import '../LoginForm/index.css'

const RegisterForm = () => {
  const { register } = useUser()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userType, setUserType] = useState('student')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setErrorMsg('')

    // Client-side validation: compare passwords in browser without calling server
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    try {
      setIsSubmitting(true)
      // Only sends the four fields Django wants (confirmPassword is not sent!)
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        user_type: userType
      })

      // On successful registration, redirect to login page with notice
      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in with your credentials.' }
      })
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-logo-box">
            <FaGraduationCap />
          </div>
          <h2 className="auth-title">Create Campus Account</h2>
          <p className="auth-subtitle">Join fellow students buying and selling on campus</p>
        </div>

        {errorMsg && (
          <div className="auth-alert error-alert">
            <FaInfoCircle /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username *</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Choose unique username"
                disabled={isSubmitting}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Campus Email (Optional)</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-type">I am signing up as</label>
            <div className="input-wrapper">
              <FaStore className="input-icon" />
              <select
                id="reg-type"
                value={userType}
                onChange={e => setUserType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="student">Student (Buyer)</option>
                <option value="seller">Seller & Buyer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min 6 chars) *</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create password"
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password *</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? <PulseLoader size={8} color="#ffffff" /> : (
              <>
                <FaUserPlus /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="auth-switch-link">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
