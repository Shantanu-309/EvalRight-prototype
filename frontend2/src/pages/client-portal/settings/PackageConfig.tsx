import '../ClientPortalHome.css'
import '../reports/reports.css'

export default function PackageConfig() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Package Config</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Package Config</span>
        </div>
      </div>

      <div className="portal-card">
        <h2 className="section-title">Purchased Packages</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Turnaround Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Premium Package</td>
                <td>3-5 business days</td>
                <td><span className="status-badge completed">Active</span></td>
              </tr>
              <tr>
                <td>Standard Package</td>
                <td>5-7 business days</td>
                <td><span className="status-badge completed">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

