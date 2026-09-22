import './reports.css'
import '../ClientPortalHome.css'

export default function Analytics() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Analytics</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Analytics</span>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon completed">📊</div>
          <div className="card-content">
            <h3 className="card-title">Completion Rate</h3>
            <p className="card-number">0%</p>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-icon pending">⏱️</div>
          <div className="card-content">
            <h3 className="card-title">Avg Turnaround</h3>
            <p className="card-number">0 days</p>
          </div>
        </div>
      </div>

      <div className="portal-card">
        <div className="chart-container">
          <div className="chart-placeholder">Analytics Charts Placeholder</div>
        </div>
      </div>
    </div>
  )
}


















