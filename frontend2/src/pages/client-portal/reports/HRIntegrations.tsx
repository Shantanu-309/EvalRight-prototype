import { useState } from 'react'
import './reports.css'
import '../ClientPortalHome.css'

export default function HRIntegrations() {
  const [integrations, setIntegrations] = useState<Array<{ name: string; apiKey: string }>>([])

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">HR Integrations</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>HR Integrations</span>
        </div>
      </div>

      <div className="portal-card">
        <h2 className="section-title">Active Integrations</h2>
        {integrations.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>No integrations configured</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Integration</th>
                  <th>API Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((int, idx) => (
                  <tr key={idx}>
                    <td>{int.name}</td>
                    <td>{int.apiKey.substring(0, 10)}...</td>
                    <td><button className="action-button" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button className="submit-button" style={{ marginTop: '1.5rem' }}>Add Integration</button>
      </div>
    </div>
  )
}

