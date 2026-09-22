import { useState } from 'react'
import '../ClientPortalHome.css'
import '../orders/orders.css'

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    companyName: 'TechCorp Solutions',
    legalName: 'TechCorp Solutions Inc.',
    address: '123 Business St, City, State 12345'
  })

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Company Profile</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Company Profile</span>
        </div>
      </div>

      <div className="portal-card">
        <form className="order-form">
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Legal Name</label>
            <input type="text" value={profile.legalName} onChange={(e) => setProfile({ ...profile, legalName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
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
          <div className="form-group">
            <label>Company Logo</label>
            <input type="file" accept="image/*" />
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Upload company logo (placeholder)</p>
          </div>
          <button type="submit" className="submit-button">Save Changes</button>
        </form>
      </div>
    </div>
  )
}


















