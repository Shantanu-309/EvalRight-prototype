import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { dashboardService, DashboardCounts } from '../../services/dashboardService'
import { orderService, Package } from '../../services/orderService'
import { invitationService } from '../../services/invitationService'
import './ClientPortalHome.css'
import './orders/orders.css'

export default function ClientPortalHome() {
  const [counts, setCounts] = useState<DashboardCounts>({
    completedOrders: 0,
    pendingOrders: 0,
    draftOrders: 0,
    activeInvitations: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRapidInvite, setShowRapidInvite] = useState(false)
  const [rapidInviteData, setRapidInviteData] = useState({
    candidateEmail: '',
    packageId: 0
  })
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [rapidInviteSuccess, setRapidInviteSuccess] = useState<string | null>(null)
  const [rapidInviteError, setRapidInviteError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Check URL params for tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'rapid') {
      setShowRapidInvite(true)
    } else if (tab === 'invitations') {
      // Could navigate to invitations list page
    }
  }, [searchParams])

  // Fetch dashboard counts
  const fetchCounts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await dashboardService.getDashboardCounts()
      setCounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Error fetching dashboard counts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch packages for rapid invitation
  const fetchPackages = async () => {
    try {
      const data = await orderService.getScreeningPackages()
      console.log('Packages fetched:', data)
      // Ensure we have packages - use fallback if empty
      if (data && data.length > 0) {
        setPackages(data)
      } else {
        console.warn('No packages returned from API, using fallback')
        setPackages([
          { id: 1, name: 'Basic Criminal Only' },
          { id: 2, name: 'Standard Verification' },
          { id: 3, name: 'Premium Verification' },
          { id: 4, name: 'Employment + Education Package' }
        ])
      }
    } catch (err) {
      console.error('Error fetching packages:', err)
      // Fallback to mock data if API fails
      setPackages([
        { id: 1, name: 'Basic Criminal Only' },
        { id: 2, name: 'Standard Verification' },
        { id: 3, name: 'Premium Verification' },
        { id: 4, name: 'Employment + Education Package' }
      ])
    }
  }

  useEffect(() => {
    fetchCounts()
    fetchPackages()
  }, [])

  const handleRapidInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rapidInviteData.candidateEmail) {
      alert('Please enter candidate email')
      return
    }

    try {
      setIsSendingInvite(true)
      
      // Use default package if not selected (first package in list, typically id=2 for STANDARD)
      const packageId = rapidInviteData.packageId || (packages.length > 0 ? packages[0].id : 2)
      
      // Send invitation using unified service
      const response = await invitationService.sendInvitation({
        candidateEmail: rapidInviteData.candidateEmail,
        packageId: packageId,
        invitationType: 'rapid'
      })
      
      if (response.success) {
        // Show purple success alert
        const successMessage = `Invitation sent successfully to ${rapidInviteData.candidateEmail}`
        setRapidInviteSuccess(successMessage)
        setRapidInviteError(null)
        setRapidInviteData({ candidateEmail: '', packageId: 0 })
        setShowRapidInvite(false)
        // Refresh counts to update active invitations
        await fetchCounts()
        setTimeout(() => setRapidInviteSuccess(null), 5000)
      } else {
        setRapidInviteError(`Failed to send invitation: ${response.message}`)
        setRapidInviteSuccess(null)
      }
    } catch (err) {
      setRapidInviteError(`Error: ${err instanceof Error ? err.message : 'Failed to send invitation'}`)
      setRapidInviteSuccess(null)
    } finally {
      setIsSendingInvite(false)
    }
  }

  return (
    <div className="portal-home">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Client Dashboard</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Home</span>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.5)', 
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      <div className="dashboard-cards">
        <Link to="/client-portal/reports/all-orders?status=completed" className="dashboard-card">
          <div className="card-icon completed">✓</div>
          <div className="card-content">
            <h3 className="card-title">Completed Orders</h3>
            <p className="card-number">{isLoading ? '...' : counts.completedOrders}</p>
          </div>
        </Link>

        <Link to="/client-portal/reports/all-orders?status=pending" className="dashboard-card">
          <div className="card-icon pending">⏳</div>
          <div className="card-content">
            <h3 className="card-title">Pending Orders</h3>
            <p className="card-number">{isLoading ? '...' : counts.pendingOrders}</p>
          </div>
        </Link>

        <Link to="/client-portal/reports/draft-orders" className="dashboard-card">
          <div className="card-icon draft">📝</div>
          <div className="card-content">
            <h3 className="card-title">Draft Orders</h3>
            <p className="card-number">{isLoading ? '...' : counts.draftOrders}</p>
          </div>
        </Link>

        <Link to="/client-portal/home?tab=invitations" className="dashboard-card">
          <div className="card-icon invitations">📧</div>
          <div className="card-content">
            <h3 className="card-title">Active Invitations</h3>
            <p className="card-number">{isLoading ? '...' : counts.activeInvitations}</p>
          </div>
        </Link>
      </div>

      <div className="dashboard-actions">
        <button 
          className="action-button rapid-invite"
          onClick={() => setShowRapidInvite(!showRapidInvite)}
        >
          Rapid Invitation
        </button>
        <button className="action-button ai-chatbot" disabled>
          AI Chatbot (Coming Soon)
        </button>
      </div>

      {showRapidInvite && (
        <div className="portal-card" style={{ marginTop: '2rem' }}>
          <h2 className="card-title">Send Rapid Invitation</h2>
          
          {rapidInviteError && (
            <div className="error-message" style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#ef4444'
            }}>
              {rapidInviteError}
            </div>
          )}

          {rapidInviteSuccess && (
            <div className="success-message" style={{ 
              padding: '1rem', 
              background: 'rgba(61, 0, 122, 0.2)', 
              border: '1px solid rgba(61, 0, 122, 0.5)', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#3D007A',
              fontWeight: '600'
            }}>
              {rapidInviteSuccess}
            </div>
          )}

          <form onSubmit={handleRapidInvite} className="order-form">
            <div className="form-group">
              <label htmlFor="candidateEmail">Candidate Email *</label>
              <input
                type="email"
                id="candidateEmail"
                value={rapidInviteData.candidateEmail}
                onChange={(e) => setRapidInviteData({ ...rapidInviteData, candidateEmail: e.target.value })}
                required
                placeholder="candidate@example.com"
              />
              <small style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                Default package will be assigned automatically
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="submit-button" disabled={isSendingInvite}>
                {isSendingInvite ? 'Sending...' : 'Send Invitation'}
              </button>
              <button 
                type="button" 
                className="action-button"
                onClick={() => {
                  setShowRapidInvite(false)
                  setRapidInviteData({ candidateEmail: '', packageId: 0 })
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
