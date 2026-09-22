import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

interface EmailLog {
  id: number
  recipient: string
  subject: string
  type: 'invitation' | 'notification' | 'system'
  sentAt: string
  status: 'sent' | 'failed' | 'pending'
  token?: string
}

export default function EmailActivityLog() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'invitation' | 'notification' | 'system'>('all')

  useEffect(() => {
    fetchEmailLogs()
  }, [])

  const fetchEmailLogs = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/email-activity')
      // setLogs(response.data)
      
      // Mock data for now - in production, this should come from backend
      setLogs([])
    } catch (error) {
      console.error('Failed to fetch email logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'sent': return 'status-success'
      case 'failed': return 'status-error'
      case 'pending': return 'status-pending'
      default: return ''
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Email Activity Log</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Support Center</span>
          <span>/</span>
          <span>Email Activity Log</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="filter-section" style={{ marginBottom: '1.5rem' }}>
          <label>Filter by type: </label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="invitation">Invitations</option>
            <option value="notification">Notifications</option>
            <option value="system">System Emails</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Sent At</th>
                <th>Status</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                    No email activity found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.recipient}</td>
                    <td>{log.subject}</td>
                    <td>
                      <span className="badge badge-info">
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(log.sentAt)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(log.status)}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {log.token ? (
                        <code style={{ fontSize: '0.85rem', color: '#888' }}>
                          {log.token.substring(0, 20)}...
                        </code>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

