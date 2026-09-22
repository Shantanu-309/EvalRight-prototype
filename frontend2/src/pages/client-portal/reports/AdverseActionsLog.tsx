import './reports.css'
import '../ClientPortalHome.css'

export default function AdverseActionsLog() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Adverse Actions Log</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Adverse Actions Log</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No adverse actions logged
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


















