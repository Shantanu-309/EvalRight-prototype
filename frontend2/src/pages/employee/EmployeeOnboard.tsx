import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './EmployeeOnboard.css'

interface VerifyTokenResponse {
  valid: boolean
  message?: string
  candidateEmail?: string
  packageId?: number
}

interface OnboardingFormData {
  firstName: string
  lastName: string
  middleName: string
  email: string
  phone: string
  dob: string
  countryOfResidence: string
  
  // Address History
  addresses: Array<{
    type: 'current' | 'previous'
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    country: string
    fromDate: string
    toDate: string
  }>
  
  // ID Uploads (simplified - in production would use file upload)
  idType: string
  idNumber: string
  
  // Consent
  acceptTerms: boolean
  acceptPrivacy: boolean
  consentToBackgroundCheck: boolean
}

export default function EmployeeOnboard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [candidateEmail, setCandidateEmail] = useState<string>('')
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dob: '',
    countryOfResidence: '',
    addresses: [
      {
        type: 'current',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        fromDate: '',
        toDate: ''
      }
    ],
    idType: '',
    idNumber: '',
    acceptTerms: false,
    acceptPrivacy: false,
    consentToBackgroundCheck: false
  })

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired link')
      setIsVerifying(false)
      return
    }

    verifyToken()
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await api.get<VerifyTokenResponse>(`/candidate/invitation/validate?token=${token}`)
      
      if (response.valid) {
        setIsValid(true)
        setCandidateEmail(response.candidateEmail || '')
        if (response.candidateEmail) {
          setFormData(prev => ({ ...prev, email: response.candidateEmail || '' }))
        }
      } else {
        setError(response.message || 'Invalid or expired invitation link.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          type: 'previous',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          fromDate: '',
          toDate: ''
        }
      ]
    }))
  }

  const removeAddress = (index: number) => {
    if (formData.addresses.length > 1) {
      setFormData(prev => ({
        ...prev,
        addresses: prev.addresses.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.acceptTerms || !formData.acceptPrivacy || !formData.consentToBackgroundCheck) {
      setError('Please accept all required consents')
      return
    }

    try {
      setIsSubmitting(true)

      // Authenticate with token to get JWT
      const authResponse = await api.post('/candidate-portal/auth', {
        invitationToken: token
      })

      // Store token for authenticated requests
      localStorage.setItem('token', authResponse.token)

      // Submit onboarding data
      await api.post('/candidate-portal/tasks/PERSONAL_INFO', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        countryOfResidence: formData.countryOfResidence
      })

      await api.post('/candidate-portal/tasks/ADDRESS_HISTORY', {
        addresses: formData.addresses
      })

      await api.post('/candidate-portal/tasks/DOCUMENTS', {
        idType: formData.idType,
        idNumber: formData.idNumber
      })

      await api.post('/candidate-portal/tasks/CONSENT', {
        acceptTerms: formData.acceptTerms,
        acceptPrivacy: formData.acceptPrivacy,
        consentToBackgroundCheck: formData.consentToBackgroundCheck
      })

      // Mark invitation token as used after successful submission
      if (token) {
        try {
          await api.post('/candidate/invitation/complete', {
            token: token
          })
        } catch (completeErr: any) {
          // Log but don't fail the submission if marking as used fails
          console.error('Failed to mark invitation as used:', completeErr)
        }
      }

      // Show success and redirect
      alert('Onboarding completed successfully! Your information has been submitted.')
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit onboarding data. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="employee-onboard-container">
        <div className="onboard-card">
          <h2>Verifying invitation...</h2>
          <p>Please wait while we verify your invitation link.</p>
        </div>
      </div>
    )
  }

  if (!isValid || error) {
    return (
      <div className="employee-onboard-container">
        <div className="onboard-card error-card">
          <h2>Invalid or Expired Link</h2>
          <p>{error || 'This invitation link is invalid or has expired. Please contact your employer for a new invitation.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="employee-onboard-container">
      <div className="onboard-header">
        <img src="/logo3.png" alt="EvalRight" className="onboard-logo" />
        <h1>Employee Onboarding</h1>
        <p>Please complete the following information to proceed with your background verification</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="onboard-form">
        {/* Personal Details Section */}
        <section className="form-section">
          <h2>Personal Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="middleName">Middle Name</label>
              <input
                type="text"
                id="middleName"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={!!candidateEmail}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth *</label>
              <input
                type="date"
                id="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="countryOfResidence">Country of Residence *</label>
              <input
                type="text"
                id="countryOfResidence"
                value={formData.countryOfResidence}
                onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* Address History Section */}
        <section className="form-section">
          <h2>Address History</h2>
          {formData.addresses.map((address, index) => (
            <div key={index} className="address-block">
              <div className="address-header">
                <h3>{address.type === 'current' ? 'Current Address' : `Previous Address ${index}`}</h3>
                {index > 0 && (
                  <button type="button" onClick={() => removeAddress(index)} className="btn-remove">
                    Remove
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State/Province *</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange(index, 'postalCode', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>From Date *</label>
                  <input
                    type="date"
                    value={address.fromDate}
                    onChange={(e) => handleAddressChange(index, 'fromDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>To Date {address.type === 'current' ? '(Leave empty if current)' : '*'}</label>
                  <input
                    type="date"
                    value={address.toDate}
                    onChange={(e) => handleAddressChange(index, 'toDate', e.target.value)}
                    required={address.type !== 'current'}
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addAddress} className="btn-add-address">
            + Add Previous Address
          </button>
        </section>

        {/* ID Uploads Section */}
        <section className="form-section">
          <h2>ID Verification</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="idType">ID Type *</label>
              <select
                id="idType"
                value={formData.idType}
                onChange={(e) => handleInputChange('idType', e.target.value)}
                required
              >
                <option value="">Select ID Type</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="idNumber">ID Number *</label>
              <input
                type="text"
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                required
              />
            </div>
          </div>
          <p className="form-note">Note: You may be asked to upload ID documents separately.</p>
        </section>

        {/* Consent Forms Section */}
        <section className="form-section">
          <h2>Consent & Authorization</h2>
          <div className="consent-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                required
              />
              <span>I accept the Terms & Conditions *</span>
            </label>
          </div>
          <div className="consent-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.acceptPrivacy}
                onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                required
              />
              <span>I accept the Privacy Policy *</span>
            </label>
          </div>
          <div className="consent-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.consentToBackgroundCheck}
                onChange={(e) => handleInputChange('consentToBackgroundCheck', e.target.checked)}
                required
              />
              <span>I consent to the background verification process *</span>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Information'}
          </button>
        </div>
      </form>
    </div>
  )
}




