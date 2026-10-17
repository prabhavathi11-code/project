import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { PulseLoader } from 'react-spinners'

const ProtectedRoute = ({ children, requireSeller = false }) => {
  const { user, isAuthenticated, isSeller, loading } = useUser()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-box">
        <PulseLoader size={12} color="#6366f1" />
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
