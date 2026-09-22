import './reports.css'
import '../ClientPortalHome.css'

export default function OrderSummaryReport() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Order Summary Report</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Order Summary Report</span>
        </div>
      </div>

      <div className="portal-card">
        <h2 className="section-title">Orders per Month</h2>
        <div className="chart-container">
          <div className="chart-placeholder">Bar Chart Placeholder</div>
        </div>
      </div>

      <div className="portal-card">
        <h2 className="section-title">Total Spend Summary</h2>
        <div className="chart-container">
          <div className="chart-placeholder">Summary Chart Placeholder</div>
        </div>
      </div>
    </div>
  )
}


















