import { useState } from 'react'
import api from '../../../services/api'
import '../CandidatePortal.css'

interface WelcomeStepProps {
  token: string
  invitationDetails: {
    employerName: string
    orderReference: string
    candidateEmail: string
  }
  onComplete: () => void
}

export default function WelcomeStep({ token, invitationDetails, onComplete }: WelcomeStepProps) {
  const [verificationMethod, setVerificationMethod] = useState<'dob' | 'ssn'>('dob')
  const [dob, setDob] = useState('')
  const [ssnLast4, setSsnLast4] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (verificationMethod === 'dob' && !dob) {
      setError('Please enter your date of birth')
      return
    }

    if (verificationMethod === 'ssn' && (!ssnLast4 || ssnLast4.length !== 4)) {
      setError('Please enter the last 4 digits of your SSN')
      return
    }

    try {
      setIsVerifying(true)
      
      const response = await api.post('/candidate-portal/auth/verify', {
        token,
        verificationMethod,
        dob: verificationMethod === 'dob' ? dob : undefined,
        ssnLast4: verificationMethod === 'ssn' ? ssnLast4 : undefined
      })

      if (response.verified) {
        onComplete()
      } else {
        setError(response.message || 'Verification failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please contact your employer if you continue to have issues.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="candidate-step-card">
      <div className="step-header">
        <h2>Welcome to EvalRight</h2>
        <p>Please verify your identity to continue with your background verification</p>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        marginBottom: '2rem' 
      }}>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Employer:</strong> {invitationDetails.employerName}
        </p>
        {invitationDetails.orderReference && (
          <p>
            <strong>Order Reference:</strong> {invitationDetails.orderReference}
          </p>
        )}
      </div>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Verification Method</label>
          <select
            value={verificationMethod}
            onChange={(e) => {
              setVerificationMethod(e.target.value as 'dob' | 'ssn')
              setError(null)
            }}
          >
            <option value="dob">Date of Birth</option>
            <option value="ssn">Last 4 Digits of SSN</option>
          </select>
        </div>

        {verificationMethod === 'dob' ? (
          <div className="form-group">
            <label htmlFor="dob">Date of Birth *</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="ssn">Last 4 Digits of SSN *</label>
            <input
              type="text"
              id="ssn"
              value={ssnLast4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                setSsnLast4(value)
              }}
              placeholder="1234"
              maxLength={4}
              required
            />
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              Enter only the last 4 digits of your Social Security Number
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="step-actions">
          <div></div>
          <button type="submit" className="btn-primary" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>
      </form>
    </div>
  )
}

