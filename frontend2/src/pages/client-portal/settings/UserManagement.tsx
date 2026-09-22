import { useState } from 'react'
import '../ClientPortalHome.css'
import '../orders/orders.css'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Admin' },
    { id: 2, name: 'Jane Doe', email: 'jane@company.com', role: 'HR Manager' },
  ])

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">User Management</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>User Management</span>
        </div>
      </div>

      <div className="portal-card">
        <button className="submit-button" style={{ marginBottom: '1.5rem' }}>Add User</button>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="action-button" style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Edit</button>
                    <button className="action-button" style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

