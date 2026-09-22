import { useState } from 'react'
import '../ClientPortalHome.css'
import '../orders/orders.css'

export default function Notifications() {
  const [settings, setSettings] = useState({
    completedCheck: true,
    invoiceAlerts: true,
    invitationAlerts: false
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Notifications</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Notifications</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Completed Check Email Alerts</label>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Receive email when background checks are completed</p>
            </div>
            <button
              onClick={() => handleToggle('completedCheck')}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '9999px',
                background: settings.completedCheck ? '#3D007A' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: settings.completedCheck ? '24px' : '2px',
                transition: 'left 0.3s ease'
              }} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Invoice Alerts</label>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Receive notifications for new invoices</p>
            </div>
            <button
              onClick={() => handleToggle('invoiceAlerts')}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '9999px',
                background: settings.invoiceAlerts ? '#3D007A' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: settings.invoiceAlerts ? '24px' : '2px',
                transition: 'left 0.3s ease'
              }} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Invitation Alerts</label>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Get notified when invitations are sent</p>
            </div>
            <button
              onClick={() => handleToggle('invitationAlerts')}
              style={{
                width: '50px',
                height: '28px',
                borderRadius: '9999px',
                background: settings.invitationAlerts ? '#3D007A' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '2px',
                left: settings.invitationAlerts ? '24px' : '2px',
                transition: 'left 0.3s ease'
              }} />
            </button>
          </div>
        </div>

        <button className="submit-button" style={{ marginTop: '1.5rem' }}>Save Settings</button>
      </div>
    </div>
  )
}


















