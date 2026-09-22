import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import LoginFormBusiness from '../components/auth/LoginFormBusiness'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyEmail: '',
    password: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({
        email: formData.companyEmail,
        password: formData.password,
      })
      // Navigation handled by AuthContext
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="login-page"
    >
      <Navbar />
      
      <div className="login-container">
        <div className="login-card">
          {/* Logo Section */}
          <div className="login-logo-container">
            <img 
              src="/logo3.png" 
              alt="EvalRight" 
              className="login-logo"
            />
          </div>

          {/* Page Title */}
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1F2937'
          }}>
            Client Login
          </h2>

          {/* Error Message */}
          {error && (
            <div className="login-error" style={{ 
              padding: '1rem 2rem', 
              margin: '0 2rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#EF4444',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Form Content */}
          <div className="login-content">
            <LoginFormBusiness
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Register Link */}
          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="login-register-link">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}



