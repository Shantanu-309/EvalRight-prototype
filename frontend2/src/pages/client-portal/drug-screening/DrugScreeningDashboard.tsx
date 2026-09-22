import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

export default function DrugScreeningDashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    pending: 0,
    completed: 0,
    positive: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/drug-screening/dashboard')
      // setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Drug Screening Dashboard</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Drug Screening</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>
      </div>

      <div className="portal-card">
        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Total Tests</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.totalTests}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Pending</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#fbbf24' }}>{stats.pending}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Completed</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#4ade80' }}>{stats.completed}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Positive Results</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#ef4444' }}>{stats.positive}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

