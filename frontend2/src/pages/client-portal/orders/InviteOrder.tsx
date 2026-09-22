import { useState, useEffect } from 'react'
import { orderService, Package } from '../../../services/orderService'
import { invitationService } from '../../../services/invitationService'
import './orders.css'

interface InviteRecord {
  email: string
  package: string
  status: string
  date: string
}

export default function InviteOrder() {
  const [formData, setFormData] = useState({
    candidateEmail: '',
    packageId: 0,
  })
  const [packages, setPackages] = useState<Package[]>([])
  const [invites, setInvites] = useState<InviteRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

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
      // Fallback packages if API fails
      setPackages([
        { id: 1, name: 'Basic Criminal Only' },
        { id: 2, name: 'Standard Verification' },
        { id: 3, name: 'Premium Verification' },
        { id: 4, name: 'Employment + Education Package' }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.candidateEmail || !formData.packageId) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)
      
      // Send invitation using unified service
      const response = await invitationService.sendInvitation({
        candidateEmail: formData.candidateEmail,
        packageId: formData.packageId,
        invitationType: 'orderWithInvitation'
      })
      
      if (response.success) {
        const selectedPackage = packages.find(p => p.id === formData.packageId)
        const newInvite: InviteRecord = {
          email: formData.candidateEmail,
          package: selectedPackage?.name || 'Unknown',
          status: 'Sent',
          date: new Date().toLocaleDateString(),
        }
        setInvites([...invites, newInvite])
        setFormData({ candidateEmail: '', packageId: 0 })
        
        // Show purple success alert
        const successMessage = `Invitation sent successfully to ${formData.candidateEmail}`
        setSuccess(successMessage)
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(response.message || 'Failed to send invitation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Order w/ Invitation</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Order w/ Invitation</span>
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

      {success && (
        <div className="success-message" style={{ 
          padding: '1rem', 
          background: 'rgba(61, 0, 122, 0.2)', 
          border: '1px solid rgba(61, 0, 122, 0.5)', 
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          color: '#3D007A',
          fontWeight: '600'
        }}>
          {success}
        </div>
      )}

      <div className="portal-card">
        <div className="card-header">
          <h2 className="card-title">Send Invitation</h2>
        </div>
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="email">Candidate Email *</label>
            <input
              type="email"
              id="email"
              value={formData.candidateEmail}
              onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="package">Screening Package *</label>
            <select
              id="package"
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: parseInt(e.target.value) })}
              required
              disabled={isLoading}
            >
              <option value="0">Select Package</option>
              {packages && packages.length > 0 ? (
                packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="1">Basic Criminal Only</option>
                  <option value="2">Standard Verification</option>
                  <option value="3">Premium Verification</option>
                  <option value="4">Employment + Education Package</option>
                </>
              )}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>

      {invites.length > 0 && (
        <div className="portal-card">
          <h2 className="card-title">Sent Invitations</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Package</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite, idx) => (
                  <tr key={idx}>
                    <td>{invite.email}</td>
                    <td>{invite.package}</td>
                    <td><span className="status-badge sent">{invite.status}</span></td>
                    <td>{invite.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
