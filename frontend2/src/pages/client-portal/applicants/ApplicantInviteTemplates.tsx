import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

interface Template {
  id: number
  name: string
  subject: string
  body: string
  isDefault: boolean
}

export default function ApplicantInviteTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/invitation-templates')
      // setTemplates(response.data)
      
      // Mock data
      setTemplates([
        {
          id: 1,
          name: 'Default Invitation',
          subject: 'Action Required: Complete Your Background Verification',
          body: 'Dear Candidate,\n\nYou have been invited to complete your background verification...',
          isDefault: true
        }
      ])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Applicant Invite Templates</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Applicants</span>
          <span>/</span>
          <span>Applicant Invite Templates</span>
        </div>
      </div>

      <div className="portal-card">
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="templates-list">
            {templates.map(template => (
              <div key={template.id} className="template-card" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3>{template.name}</h3>
                  {template.isDefault && <span className="badge badge-info">Default</span>}
                </div>
                <p><strong>Subject:</strong> {template.subject}</p>
                <p><strong>Body:</strong> {template.body.substring(0, 100)}...</p>
                <button 
                  className="btn-primary" 
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => setEditingTemplate(template)}
                >
                  Edit Template
                </button>
              </div>
            ))}
            <button className="btn-primary" onClick={() => {
              // TODO: Create new template
              console.log('Create new template')
            }}>
              + Create New Template
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

