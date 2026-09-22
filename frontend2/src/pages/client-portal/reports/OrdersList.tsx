import { useState } from 'react'
import './reports.css'
import '../ClientPortalHome.css'

export default function OrdersList() {
  const [filters, setFilters] = useState({ status: '', dateRange: '', keyword: '' })

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Orders List</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Orders List</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="filters-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <input type="date" />
          </div>
          <div className="form-group">
            <label>Keyword Search</label>
            <input type="text" placeholder="Search..." value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} />
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Candidate</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                  No orders found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

