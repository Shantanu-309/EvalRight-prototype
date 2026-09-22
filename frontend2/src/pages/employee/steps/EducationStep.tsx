import { useState } from 'react'

interface Education {
  institution: string
  degree: string
  major: string
  graduationDate: string
  country: string
  certificateNumber?: string
}

interface EducationStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function EducationStep({ state, onComplete, onBack, error, setError }: EducationStepProps) {
  const [educations, setEducations] = useState<Education[]>([
    {
      institution: '',
      degree: '',
      major: '',
      graduationDate: '',
      country: 'United States',
      certificateNumber: '',
    }
  ])

  const addEducation = () => {
    setEducations([...educations, {
      institution: '',
      degree: '',
      major: '',
      graduationDate: '',
      country: 'United States',
      certificateNumber: '',
    }])
  }

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index))
    }
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations]
    updated[index] = { ...updated[index], [field]: value }
    setEducations(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    for (const edu of educations) {
      if (!edu.institution || !edu.degree || !edu.graduationDate) {
        setError('Please fill in all required education fields.')
        return
      }
    }

    onComplete({ educations })
  }

  return (
    <div className="education-step">
      <h1>Education History</h1>
      <p>Please provide your educational background:</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="step-form">
        {educations.map((education, index) => (
          <div key={index} className="education-block" style={{ 
            padding: '1.5rem', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Education {index + 1}</h3>
              {educations.length > 1 && (
                <button type="button" onClick={() => removeEducation(index)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Institution Name *</label>
              <input
                type="text"
                value={education.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Degree *</label>
                <input
                  type="text"
                  value={education.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  required
                  placeholder="e.g., Bachelor's, Master's"
                />
              </div>
              <div className="form-group">
                <label>Major/Field of Study</label>
                <input
                  type="text"
                  value={education.major}
                  onChange={(e) => updateEducation(index, 'major', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Graduation Date *</label>
                <input
                  type="date"
                  value={education.graduationDate}
                  onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={education.country}
                  onChange={(e) => updateEducation(index, 'country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Certificate Number (Optional)</label>
              <input
                type="text"
                value={education.certificateNumber || ''}
                onChange={(e) => updateEducation(index, 'certificateNumber', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addEducation} className="btn-secondary">
          + Add Another Education
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

