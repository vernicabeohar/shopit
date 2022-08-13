import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import axios from 'axios'

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Home from "./components/Home"
import ProductDetails from './components/product/ProductDetails'

import Cart from './components/cart/Cart';
import Shipping from './components/cart/Shipping';
import ConfirmOrder from './components/cart/ConfirmOrder';
import Payment from './components/cart/Payment';
import OrderSuccess from './components/cart/OrderSuccess';

import ListOrders from './components/order/ListOrders';
import OrderDetails from './components/order/OrderDetails';

import Login from './components/user/Login'
import Register from './components/user/Register';
import Profile from './components/user/Profile'
import UpdateProfile from './components/user/UpdateProfile';
import UpdatePassword from './components/user/UpdatePassword';
import ForgotPassword from './components/user/ForgotPassword';
import NewPassword from './components/user/NewPassword';

import Dashboard from './components/admin/Dashboard'
import ProductsList from './components/admin/ProductsList'
import NewProduct from './components/admin/NewProduct'
import UpdateProduct from './components/admin/UpdateProduct'
import OrdersList from './components/admin/OrdersList'
import ProcessOrder from './components/admin/ProcessOrder'
import UsersList from './components/admin/UsersList'
import UpdateUser from './components/admin/UpdateUser'
import ProductReviews from './components/admin/ProductReviews'

import ProtectedRoute from './components/route/ProtectedRoute';
import { loadUser } from './actions/userActions'
import store from './store'

// Payment
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

function App() {

  const [stripeApiKey, setStripeApiKey] = useState('');

  useEffect(() => {
    store.dispatch(loadUser())

    async function getStripApiKey() {
      const { data } = await axios.get('/api/v1/stripeapi');

      setStripeApiKey(data.stripeApiKey)
    }

    getStripApiKey();

  }, [])

  const { user, isAuthenticated, loading } = useSelector(state => state.auth)

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container container-fluid">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search/:keyword" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
            <Route path="/order/confirm" element={<ProtectedRoute><ConfirmOrder /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            {stripeApiKey &&
              <Elements stripe={loadStripe(stripeApiKey)}>
                <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              </Elements>
            }

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<NewPassword />} />

            <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/me/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
            <Route path="/password/update" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

            <Route path="/orders/me" element={<ProtectedRoute><ListOrders /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          </Routes>
        </div>

        <Routes>
          <Route path="/dashboard" isAdmin={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/products" isAdmin={true} element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
          <Route path="/admin/product" isAdmin={true} element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
          <Route path="/admin/product/:id" isAdmin={true} element={<ProtectedRoute><UpdateProduct /></ProtectedRoute>} />
          <Route path="/admin/orders" isAdmin={true} element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
          <Route path="/admin/order/:id" isAdmin={true} element={<ProtectedRoute><ProcessOrder /></ProtectedRoute>} />
          <Route path="/admin/users" isAdmin={true} element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/admin/user/:id" isAdmin={true} element={<ProtectedRoute><UpdateUser /></ProtectedRoute>} />
          <Route path="/admin/reviews" isAdmin={true} element={<ProtectedRoute><ProductReviews /></ProtectedRoute>} />
        </Routes>

        {!loading && (!isAuthenticated || user.role !== 'admin') && (
          <Footer />
        )}
      </div>
    </Router>
  );
}

export default App;
