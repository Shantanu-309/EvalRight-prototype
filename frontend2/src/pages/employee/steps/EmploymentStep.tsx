import { useState } from 'react'

interface Employment {
  employerName: string
  designation: string
  fromDate: string
  toDate: string
  location: string
  contactInfo: string
  isCurrent: boolean
}

interface EmploymentStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function EmploymentStep({ state, onComplete, onBack, error, setError }: EmploymentStepProps) {
  const [employments, setEmployments] = useState<Employment[]>([
    {
      employerName: '',
      designation: '',
      fromDate: '',
      toDate: '',
      location: '',
      contactInfo: '',
      isCurrent: false,
    }
  ])

  const addEmployment = () => {
    setEmployments([...employments, {
      employerName: '',
      designation: '',
      fromDate: '',
      toDate: '',
      location: '',
      contactInfo: '',
      isCurrent: false,
    }])
  }

  const removeEmployment = (index: number) => {
    if (employments.length > 1) {
      setEmployments(employments.filter((_, i) => i !== index))
    }
  }

  const updateEmployment = (index: number, field: keyof Employment, value: any) => {
    const updated = [...employments]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'isCurrent' && value === true) {
      updated[index].toDate = ''
    }
    setEmployments(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    for (const emp of employments) {
      if (!emp.employerName || !emp.designation || !emp.fromDate) {
        setError('Please fill in all required employment fields.')
        return
      }
      if (!emp.isCurrent && !emp.toDate) {
        setError('Please provide an end date for previous employment.')
        return
      }
    }

    onComplete({ employments })
  }

  return (
    <div className="employment-step">
      <h1>Employment History</h1>
      <p>Please provide your employment history:</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="step-form">
        {employments.map((employment, index) => (
          <div key={index} className="employment-block" style={{ 
            padding: '1.5rem', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Employment {index + 1}</h3>
              {employments.length > 1 && (
                <button type="button" onClick={() => removeEmployment(index)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Employer Name *</label>
              <input
                type="text"
                value={employment.employerName}
                onChange={(e) => updateEmployment(index, 'employerName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Job Title/Designation *</label>
              <input
                type="text"
                value={employment.designation}
                onChange={(e) => updateEmployment(index, 'designation', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  value={employment.fromDate}
                  onChange={(e) => updateEmployment(index, 'fromDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{employment.isCurrent ? 'To Date (Leave empty if current)' : 'To Date *'}</label>
                <input
                  type="date"
                  value={employment.toDate}
                  onChange={(e) => updateEmployment(index, 'toDate', e.target.value)}
                  disabled={employment.isCurrent}
                  required={!employment.isCurrent}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={employment.location}
                  onChange={(e) => updateEmployment(index, 'location', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Contact Information</label>
                <input
                  type="text"
                  value={employment.contactInfo}
                  onChange={(e) => updateEmployment(index, 'contactInfo', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={employment.isCurrent}
                  onChange={(e) => updateEmployment(index, 'isCurrent', e.target.checked)}
                />
                {' '}This is my current employment
              </label>
            </div>
          </div>
        ))}

        <button type="button" onClick={addEmployment} className="btn-secondary">
          + Add Another Employment
        </button>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

