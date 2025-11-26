import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage/LandingPage'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/Dashboard/Dashboard'
import AllInvoices from './pages/Invoices/AllInvoices'
import CreateInvoice from './pages/Invoices/CreateInvoice'
import InvoiceDetail from './pages/Invoices/InvoiceDetail'
import ProfilePage from './pages/Profile/ProfilePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Security from './pages/Profile/Security'
import Settings from './pages/Profile/Settings'
import UpgradePlan from './pages/Profile/UpgradePlan'
import AllReceipts from './pages/Receipts/AllReceipts'
import ReceiptDetail from './pages/Receipts/ReceiptDetail'

const App = () => {
  return (
    <AuthProvider className=''>
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path='/' element={<LandingPage />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<SignUp />} />

                {/* Catch all routes */}
                <Route path='*' element={<Navigate to='/' replace />} />
                
                {/* Protected Routes */}
                <Route path='/' element={<ProtectedRoute />}>
                    <Route path='dashboard' element={<Dashboard />} />
                    <Route path='invoices' element={<AllInvoices />} />
                    <Route path='invoices/new' element={<CreateInvoice />} />
                    <Route path='invoices/:id' element={<InvoiceDetail />} />
                    <Route path='receipts' element={<AllReceipts />} />
                    {/* <Route path='receipt/new' element={<CreateInvoice />} /> */}
                    <Route path='receipts/:id' element={<ReceiptDetail />} />
                    <Route path='profile' element={<ProfilePage />} />
                    <Route path='settings' element={<Settings />} />
                    <Route path='security' element={<Security />} />
                    <Route path='upgrade-plan' element={<UpgradePlan />} />
                </Route>

            </Routes>
        </Router>

        <Toaster
            toastOptions={{
                className: "",
                style: {
                    fontSize: "13px",
                }
            }} 
        />
    </AuthProvider>
  )
}

export default App