import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  apiFetch,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens
} from '../api'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await apiFetch('/api/users/profile/')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        clearTokens()
        setUser(null)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const login = async (username, password) => {
    const response = await apiFetch('/api/users/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()

    if (!response.ok) {
      // Login error shape: { "detail": "..." }
      throw new Error(data.detail || 'Login failed. Please check your credentials.')
    }

    saveTokens({ access: data.access, refresh: data.refresh })
    await fetchProfile()
    return data
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await apiFetch('/api/users/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken })
        })
      }
    } catch (err) {
      console.error('Logout error on server:', err)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  const register = async ({ username, password, email, user_type }) => {
    const response = await apiFetch('/api/users/register/', {
      method: 'POST',
      body: JSON.stringify({ username, password, email, user_type })
    })

    const data = await response.json()

    if (!response.ok) {
      // Handles both { detail: "..." } and { username: ["..."] }
      if (data.username && Array.isArray(data.username)) {
        throw new Error(data.username[0])
      }
      if (data.detail) {
        throw new Error(data.detail)
      }
      const firstKey = Object.keys(data)[0]
      throw new Error(firstKey ? `${firstKey}: ${data[firstKey]}` : 'Registration failed.')
    }

    return data
  }

  const isAuthenticated = Boolean(user)
  const isSeller = user?.user_type === 'seller'

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isSeller,
        login,
        logout,
        register,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
