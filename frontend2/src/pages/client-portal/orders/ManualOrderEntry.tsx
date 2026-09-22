import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderService, ManualOrderRequest, Package } from '../../../services/orderService'
import { invitationService } from '../../../services/invitationService'
import './orders.css'

export default function ManualOrderEntry() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ManualOrderRequest>({
    firstName: '',
    lastName: '',
    email: '',
    packageId: 0,
  })
  const [packages, setPackages] = useState<Package[]>([])
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
      // Fallback to mock data if API fails
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
    setSuccess(null)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.packageId) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)
      
      // Create the order
      const orderResponse = await orderService.createManualOrder(formData)
      
      if (!orderResponse.success) {
        setError(orderResponse.message || 'Failed to create order')
        setSuccess(null)
        return
      }

      // Send invitation email using unified service
      const invitationResponse = await invitationService.sendInvitation({
        candidateEmail: formData.email,
        packageId: formData.packageId,
        invitationType: 'manual'
      })

      if (invitationResponse.success) {
        // Show purple success alert
        const successMessage = `Invitation sent successfully to ${formData.email}`
        setSuccess(successMessage)
        setError(null)
        setTimeout(() => {
          navigate('/client-portal/home')
        }, 2000)
      } else {
        // Order was created but invitation failed
        setError(`Order created but invitation failed: ${invitationResponse.message}`)
        setSuccess(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      setSuccess(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Manual Order Entry</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Manual Order Entry</span>
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
          <h2 className="card-title">Manual Candidate Entry</h2>
        </div>
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="package">Package *</label>
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
            {isLoading ? 'Creating Order...' : 'Submit Order ✓'}
          </button>
        </form>
      </div>
    </div>
  )
}
