import './reports.css'
import '../ClientPortalHome.css'

export default function ElectronicConsents() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Electronic Consents</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Electronic Consents</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Consent Date</th>
                <th>Document</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No consent files available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


















