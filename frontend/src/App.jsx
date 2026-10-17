import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './components/Home'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Listings from './components/Listings'
import ListingItemDetails from './components/ListingItemDetails'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import MyOrders from './components/MyOrders'
import OrderDetails from './components/OrderDetails'
import SellerLayout from './components/Seller/SellerLayout'
import SellerDashboard from './components/Seller/SellerDashboard'
import MyListings from './components/Seller/MyListings'
import ProductForm from './components/Seller/ProductForm'
import SellerOrders from './components/Seller/SellerOrders'
import CampusChatbot from './components/CampusChatbot'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './components/NotFound'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header />

      {/* Main Routed Content */}
      <main className="app-main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingItemDetails />} />

          {/* Student & Buyer Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* Seller Operations Hub (Nested Routes) */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboard />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/new" element={<ProductForm />} />
            <Route path="listings/:id/edit" element={<ProductForm />} />
            <Route path="orders" element={<SellerOrders />} />
          </Route>

          {/* 404 Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Floating 24/7 AI Campus Assistant */}
      <CampusChatbot />

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

export default App
