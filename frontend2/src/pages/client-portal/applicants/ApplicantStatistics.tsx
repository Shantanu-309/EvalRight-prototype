import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

interface Statistics {
  totalApplicants: number
  completed: number
  inProgress: number
  pending: number
  averageCompletionTime: number
}

export default function ApplicantStatistics() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/applicants/statistics')
      // setStats(response.data)
      
      // Mock data
      setStats({
        totalApplicants: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        averageCompletionTime: 0
      })
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Applicant Statistics</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Applicants</span>
          <span>/</span>
          <span>Applicant Statistics</span>
        </div>
      </div>

      <div className="portal-card">
        {loading ? (
          <p>Loading statistics...</p>
        ) : stats ? (
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Total Applicants</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.totalApplicants}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Completed</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#4ade80' }}>{stats.completed}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>In Progress</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#fbbf24' }}>{stats.inProgress}</p>
            </div>
            <div className="stat-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>Pending</h3>
              <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', color: '#94a3b8' }}>{stats.pending}</p>
            </div>
          </div>
        ) : (
          <p>No statistics available</p>
        )}
      </div>
    </div>
  )
}

