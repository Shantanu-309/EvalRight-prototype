import './reports.css'
import '../ClientPortalHome.css'

export default function DraftOrderList() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Draft Order List</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Draft Order List</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Draft Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No draft orders
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


















