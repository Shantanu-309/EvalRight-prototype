import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { applicantService, ApplicantListItem } from '../../../services/applicantService'
import './applicants.css'
import '../ClientPortalHome.css'

export default function ApplicantListTable() {
  const [applicants, setApplicants] = useState<ApplicantListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadApplicants()
  }, [])

  const loadApplicants = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await applicantService.getApplicantsList()
      setApplicants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicants')
      console.error('Error fetching applicants:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('completed') || statusLower.includes('clear')) return 'completed'
    if (statusLower.includes('pending') || statusLower.includes('invited')) return 'pending'
    if (statusLower.includes('progress') || statusLower.includes('verification')) return 'processing'
    if (statusLower.includes('adverse') || statusLower.includes('flagged')) return 'error'
    return 'pending'
  }

  if (isLoading) {
    return (
      <div className="portal-page">
        <div className="portal-page-header">
          <h1 className="portal-page-title">Applicants</h1>
          <div className="portal-breadcrumbs">
            <span>Dashboard</span>
            <span>/</span>
            <span>Applicants</span>
          </div>
        </div>
        <div className="portal-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Loading applicants...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-page">
        <div className="portal-page-header">
          <h1 className="portal-page-title">Applicants</h1>
          <div className="portal-breadcrumbs">
            <span>Dashboard</span>
            <span>/</span>
            <span>Applicants</span>
          </div>
        </div>
        <div className="portal-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>
            <button onClick={loadApplicants} className="action-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Applicants</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Applicants</span>
        </div>
      </div>

      <div className="portal-card">
        {applicants.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>No applicants found. Invite candidates to start the verification process.</p>
            <button 
              onClick={() => navigate('/client-portal/orders/invite-order')} 
              className="action-button"
              style={{ marginTop: '1rem' }}
            >
              Create Invitation
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Package</th>
                  <th>Verification Status</th>
                  <th>Invitation Status</th>
                  <th>Submitted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((app) => (
                  <tr key={app.candidateId}>
                    <td>
                      <Link 
                        to={`/client-portal/applicants/profile/${app.candidateId}`} 
                        className="link"
                      >
                        {app.fullName}
                      </Link>
                    </td>
                    <td>{app.email}</td>
                    <td>{app.packageName || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(app.verificationStatus)}`}>
                        {app.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(app.invitationStatus)}`}>
                        {app.invitationStatus}
                      </span>
                    </td>
                    <td>{formatDate(app.submittedAt)}</td>
                    <td>
                      <Link 
                        to={`/client-portal/applicants/profile/${app.candidateId}`} 
                        className="link"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}















