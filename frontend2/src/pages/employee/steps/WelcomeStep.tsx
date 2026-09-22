import { useState } from 'react'
import api from '../../../services/api'

interface WelcomeStepProps {
  state: any
  onVerificationComplete: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function WelcomeStep({ state, onVerificationComplete, error, setError }: WelcomeStepProps) {
  const [verificationMethod, setVerificationMethod] = useState<'dob' | 'ssn'>('dob')
  const [dob, setDob] = useState('')
  const [ssnLast4, setSsnLast4] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsVerifying(true)

    try {
      const response = await api.post('/candidate-portal/auth/verify', {
        token: state.token,
        verificationMethod,
        dob: verificationMethod === 'dob' ? dob : undefined,
        ssnLast4: verificationMethod === 'ssn' ? ssnLast4 : undefined,
      })

      if (response.verified) {
        onVerificationComplete()
      } else {
        setError('Verification failed. Please check your information and try again.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="portal-page">
      {/* Page Header - Client Portal Style */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">Identity Verification</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
          You've been invited by <strong>{state.employerName}</strong> to complete your background verification.
        </p>
        {state.orderId && (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Order Reference: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{state.orderId}</code>
          </p>
        )}
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
      <div>
        <p style={{ marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Please verify your identity to continue with your background verification.
        </p>

        <form onSubmit={handleVerify} className="order-form">
          <div className="form-group">
            <label>Verification Method</label>
            <select 
              value={verificationMethod} 
              onChange={(e) => setVerificationMethod(e.target.value as 'dob' | 'ssn')}
            >
              <option value="dob">Date of Birth</option>
              <option value="ssn">Last 4 digits of SSN</option>
            </select>
          </div>

          {verificationMethod === 'dob' ? (
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Last 4 digits of SSN *</label>
              <input
                type="text"
                value={ssnLast4}
                onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="1234"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button type="submit" className="submit-button" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
