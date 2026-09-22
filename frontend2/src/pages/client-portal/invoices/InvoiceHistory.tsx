import '../ClientPortalHome.css'
import '../reports/reports.css'

export default function InvoiceHistory() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Invoice History</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Invoice History</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No invoices found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

