import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import CloudBackground from '../../components/portal/CloudBackground'
import ThemeToggle from '../../components/portal/ThemeToggle'
import VerificationForm from './VerificationForm'
import '../client-portal/shared.css'
import '../client-portal/orders/orders.css'
import './EmployeePortal.css'

export default function EmployeePortal() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const invitationId = searchParams.get('invitationId')
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<{
    candidateId: number
    orderId: number | null
    employerName: string
    isSubmitted: boolean
  } | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired invitation link. Please contact your employer for a new invitation.')
      setLoading(false)
      return
    }

    validateInvitation()
  }, [token, invitationId])

  const validateInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string with both invitationId and token
      const params = new URLSearchParams()
      if (invitationId) {
        params.append('invitationId', invitationId)
      }
      params.append('token', token!)

      // First validate the invitation using the validate endpoint
      const validateResponse = await api.get(`/candidate/invitation/validate?${params.toString()}`)
      
      if (!validateResponse.valid) {
        // Validation failed - show access denied
        setError(validateResponse.message || 'Invalid or expired invitation link. Please contact your employer for a new invitation.')
        setLoading(false)
        return
      }

      // If validation succeeds, get invitation details
      const detailsResponse = await api.get(`/candidate-portal/invitation-details?${params.toString()}`)
      
      if (detailsResponse.isSubmitted) {
        setError('This verification has already been submitted.')
        setLoading(false)
        return
      }

      setInvitationData({
        candidateId: detailsResponse.candidateId,
        orderId: detailsResponse.orderId,
        employerName: detailsResponse.employerName || 'Your Employer',
        isSubmitted: false,
      })
    } catch (err: any) {
      // API errors are thrown as Error objects with message property
      // 400/401/404 from the validate endpoint indicate invalid/expired invitation
      const errorMessage = err.message || 'Invalid or expired invitation link. Please contact your employer for a new invitation.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="employee-portal-container">
        <CloudBackground />
        <div className="employee-portal-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !token || !invitationData) {
    return (
      <div className="employee-portal-container">
        <CloudBackground />
        <div className="employee-portal-error">
          <div className="error-card">
            <h2>Access Denied</h2>
            <div className="error-message" style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              color: '#ef4444'
            }}>
              {error || 'Invalid or expired invitation link.'}
            </div>
            <button onClick={() => navigate('/')} className="action-button" style={{ width: '100%' }}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="employee-portal-container">
      <CloudBackground />
      
      {/* Header - Client Portal Style */}
      <header className="employee-portal-header">
        <div className="employee-portal-logo">
          <img src="/logo3.png" alt="EvalRight" className="logo-image" />
        </div>
        <ThemeToggle />
      </header>

      <div className="employee-portal-content-wrapper">
        {/* Single Page Verification Form */}
        <VerificationForm
          token={token}
          candidateId={invitationData.candidateId}
          orderId={invitationData.orderId}
          employerName={invitationData.employerName}
        />
      </div>
    </div>
  )
}
