import { useState } from 'react'
import '../ClientPortalHome.css'
import '../orders/orders.css'

export default function BillingContactInfo() {
  const [billingInfo, setBillingInfo] = useState({
    email: 'billing@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, City, State 12345'
  })

  const handleSave = () => {
    // Placeholder: Save to backend
    alert('Billing information saved!')
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Billing Contact Info</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Billing Contact Info</span>
        </div>
      </div>

      <div className="portal-card">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="order-form">
          <div className="form-group">
            <label htmlFor="billingEmail">Billing Email</label>
            <input
              type="email"
              id="billingEmail"
              value={billingInfo.email}
              onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="billingPhone">Phone</label>
            <input
              type="tel"
              id="billingPhone"
              value={billingInfo.phone}
              onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="billingAddress">Address</label>
            <textarea
              id="billingAddress"
              value={billingInfo.address}
              onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
              rows={3}
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          <button type="submit" className="submit-button">Save Changes</button>
        </form>
      </div>
    </div>
  )
}


















