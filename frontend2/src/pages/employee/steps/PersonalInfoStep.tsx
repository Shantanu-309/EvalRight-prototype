import { useState } from 'react'

interface PersonalInfoStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function PersonalInfoStep({ state, onComplete, onBack, error, setError }: PersonalInfoStepProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dob: '',
    ssn: '',
    phone: '',
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.ssn || !formData.phone) {
      setError('Please fill in all required fields.')
      return
    }

    // Validate SSN format (XXX-XX-XXXX)
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/
    if (!ssnRegex.test(formData.ssn)) {
      setError('Please enter SSN in format XXX-XX-XXXX')
      return
    }

    onComplete(formData)
  }

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`
  }

  return (
    <div className="portal-page">
      {/* Page Header - Client Portal Style */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">Personal Information</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
          Please provide your personal details.
        </p>
      </div>

      {/* Error Alert - Client Portal Style */}
      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.5)', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="order-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Middle Name</label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>SSN *</label>
            <input
              type="text"
              value={formData.ssn}
              onChange={(e) => setFormData({ ...formData, ssn: formatSSN(e.target.value) })}
              required
              maxLength={11}
              placeholder="XXX-XX-XXXX"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              required
              placeholder="(XXX) XXX-XXXX"
            />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Action Buttons - Bottom Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button type="button" onClick={onBack} className="action-button">
            Back
          </button>
          <button type="submit" className="submit-button">
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
