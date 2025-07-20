import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'
import SellerLogin from './components/SellerLogin'
import SellerLayout from './pages/SellerLayout'
import AddProduct from './pages/AddProduct'
import ProductList from './pages/ProductList'
import Orders from './pages/Orders'
import CustomerList from './pages/Customer'
import Dashboard from './pages/Dashboard'

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const { isSeller } = useAppContext();
  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>

      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path='product-list' element={<ProductList />} />
            <Route path='orders' element={<Orders />} />
            <Route path="/seller/user" element={<CustomerList />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App
