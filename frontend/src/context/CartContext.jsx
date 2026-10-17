import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch, getAccessToken } from '../api'
import { formatCartItem } from '../format'
import { useUser } from './UserContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useUser()
  const [cartItems, setCartItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(false)

  const getCart = useCallback(async () => {
    if (!getAccessToken()) {
      setCartItems([])
      setTotalItems(0)
      setTotalPrice(0)
      return
    }

    try {
      setLoading(true)
      const response = await apiFetch('/api/cart/')
      if (response.ok) {
        const data = await response.json()
        const formatted = (data.items || []).map(formatCartItem)
        setCartItems(formatted)
        setTotalItems(Number(data.total_items || 0))
        setTotalPrice(Number(data.total_price || 0))
      }
    } catch (err) {
      console.error('Failed to get cart:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      getCart()
    } else {
      setCartItems([])
      setTotalItems(0)
      setTotalPrice(0)
    }
  }, [isAuthenticated, getCart])

  const addToCart = async (listingId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in with your campus account to add items to the cart.')
    }

    const response = await apiFetch('/api/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ listing: listingId, quantity })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Could not add item to cart.')
    }

    await getCart()
  }

  const updateCartItem = async (rowId, newQuantity) => {
    if (!isAuthenticated) return

    const response = await apiFetch(`/api/cart/items/${rowId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: newQuantity })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || 'Could not update cart quantity.')
    }

    await getCart()
  }

  const removeCartItem = async rowId => {
    if (!isAuthenticated) return

    const response = await apiFetch(`/api/cart/items/${rowId}/`, {
      method: 'DELETE'
    })

    if (!response.ok && response.status !== 204) {
      const err = await response.json()
      throw new Error(err.detail || 'Could not remove item from cart.')
    }

    await getCart()
  }

  const clearCart = async () => {
    if (!isAuthenticated) return
    try {
      await apiFetch('/api/cart/', { method: 'DELETE' })
    } catch (err) {
      console.error('Clear cart error:', err)
    }
    await getCart()
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalPrice,
        loading,
        getCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
