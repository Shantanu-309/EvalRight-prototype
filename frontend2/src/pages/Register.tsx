import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import RegisterFormBusiness from '../components/auth/RegisterFormBusiness'
import { useAuth } from '../contexts/AuthContext'
import './Register.css'

export default function Register() {
  const { registerClient } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    legalName: '',
    businessEmail: '',
    companyPhone: '',
    country: '',
    industry: '',
    website: '',
    fullName: '',
    designation: '',
    workEmail: '',
    workPhone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('') // Clear error on input change
    setSuccess('') // Clear success on input change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await registerClient({
        companyName: formData.companyName,
        legalName: formData.legalName,
        companyEmail: formData.businessEmail,
        companyPhoneNumber: formData.companyPhone,
        country: formData.country,
        industry: formData.industry,
        fullName: formData.fullName,
        designation: formData.designation,
        workEmail: formData.workEmail,
        workPhoneNumber: formData.workPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.acceptTerms,
        acceptPrivacyPolicy: formData.acceptPrivacy,
        captchaToken: 'placeholder', // TODO: Implement real captcha
      })
      setSuccess('Your account has been submitted for verification. You will be notified once approved.')
      // Optionally redirect to login after a delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="register-page"
    >
      <Navbar />
      
      <div className="register-container">
        <div className="register-card">
          {/* Logo Section */}
          <div className="register-logo-container">
            <img 
              src="/logo3.png" 
              alt="EvalRight" 
              className="register-logo"
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
            Client Registration
          </h2>

          {/* Error Message */}
          {error && (
            <div className="register-error" style={{ 
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

          {/* Success Message */}
          {success && (
            <div className="register-success" style={{ 
              padding: '1rem 2rem', 
              margin: '0 2rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '0.5rem',
              color: '#10B981',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          {/* Form Content */}
          <div className="register-content">
            <RegisterFormBusiness
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          {/* Login Link */}
          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="register-login-link">
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

