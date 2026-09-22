import '../ClientPortalHome.css'
import '../reports/reports.css'

export default function ResultsInbox() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Results Inbox</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Results Inbox</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Test Type</th>
                <th>Date</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No test results available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

