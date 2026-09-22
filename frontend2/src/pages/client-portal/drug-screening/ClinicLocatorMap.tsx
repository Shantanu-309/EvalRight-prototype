import '../ClientPortalHome.css'

export default function ClinicLocatorMap() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Clinic Locator Map</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Clinic Locator Map</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="chart-container" style={{ minHeight: '500px' }}>
          <div className="chart-placeholder">Map Placeholder - Clinic Locator</div>
        </div>
      </div>
    </div>
  )
}


















