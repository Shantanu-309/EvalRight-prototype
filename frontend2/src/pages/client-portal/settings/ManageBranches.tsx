import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

interface Branch {
  id: number
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  isActive: boolean
}

export default function ManageBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/branches')
      // setBranches(response.data)
      
      // Mock data
      setBranches([])
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Manage Branches</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Account Settings</span>
          <span>/</span>
          <span>Manage Branches</span>
        </div>
      </div>

      <div className="portal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Branches</h2>
          <button 
            className="btn-primary" 
            onClick={() => {
              setEditingBranch(null)
              setShowForm(true)
            }}
          >
            + Add Branch
          </button>
        </div>

        {loading ? (
          <p>Loading branches...</p>
        ) : branches.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>No branches found. Add your first branch to get started.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => (
                  <tr key={branch.id}>
                    <td>{branch.name}</td>
                    <td>{branch.address}</td>
                    <td>{branch.city}</td>
                    <td>{branch.state}</td>
                    <td>
                      <span className={`status-badge ${branch.isActive ? 'status-success' : 'status-pending'}`}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-secondary"
                        onClick={() => {
                          setEditingBranch(branch)
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

