import { useState, useEffect } from 'react'
import api from '../../../services/api'

interface ReviewStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  onFinalSubmit: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function ReviewStep({ state, onComplete, onBack, onFinalSubmit, error, setError }: ReviewStepProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await api.get('/candidate-portal/review/summary', {
        params: { token: state.token, candidateId: state.candidateId },
      })
      setSummary(response)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load summary.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await onFinalSubmit()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.')
    }
  }

  if (loading) {
    return <div>Loading summary...</div>
  }

  return (
    <div className="review-step">
      <h1>Review & Submit</h1>
      <p>Please review all your information before submitting:</p>

      {error && <div className="error-message">{error}</div>}

      <div className="review-sections">
        {/* Personal Info */}
        {summary?.personalInfo && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Personal Information</h3>
            <div className="review-data">
              <p><strong>Name:</strong> {summary.personalInfo.firstName} {summary.personalInfo.middleName} {summary.personalInfo.lastName}</p>
              <p><strong>DOB:</strong> {summary.personalInfo.dob}</p>
              <p><strong>Email:</strong> {summary.personalInfo.email}</p>
              <p><strong>Phone:</strong> {summary.personalInfo.phone}</p>
            </div>
          </section>
        )}

        {/* Address History */}
        {summary?.addresses && summary.addresses.length > 0 && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Address History</h3>
            {summary.addresses.map((addr: any, index: number) => (
              <div key={index} className="review-data" style={{ marginBottom: '1rem' }}>
                <p><strong>Address {index + 1}:</strong> {addr.addressLine1}, {addr.city}, {addr.state} {addr.zipCode}</p>
                <p><strong>Period:</strong> {addr.fromDate} to {addr.isCurrent ? 'Present' : addr.toDate}</p>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {summary?.educations && summary.educations.length > 0 && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Education</h3>
            {summary.educations.map((edu: any, index: number) => (
              <div key={index} className="review-data" style={{ marginBottom: '1rem' }}>
                <p><strong>{edu.institution}</strong> - {edu.degree}</p>
                <p>Major: {edu.major || 'N/A'} | Graduated: {edu.graduationDate}</p>
              </div>
            ))}
          </section>
        )}

        {/* Employment */}
        {summary?.employments && summary.employments.length > 0 && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Employment History</h3>
            {summary.employments.map((emp: any, index: number) => (
              <div key={index} className="review-data" style={{ marginBottom: '1rem' }}>
                <p><strong>{emp.employerName}</strong> - {emp.designation}</p>
                <p>Period: {emp.fromDate} to {emp.isCurrent ? 'Present' : emp.toDate}</p>
              </div>
            ))}
          </section>
        )}

        {/* Documents */}
        {summary?.documents && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Documents</h3>
            <div className="review-data">
              {summary.documents.idProof && <p>✓ ID Proof uploaded</p>}
              {summary.documents.diploma && <p>✓ Diploma/Certificate uploaded</p>}
            </div>
          </section>
        )}

        {/* Social Media */}
        {summary?.socialMedia && summary.socialMedia.profiles && summary.socialMedia.profiles.length > 0 && (
          <section className="review-section" style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <h3>Social Media Profiles</h3>
            <div className="review-data">
              {summary.socialMedia.profiles.map((profile: any, index: number) => (
                <p key={index}><strong>{profile.platform}:</strong> {profile.url}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button type="submit" onClick={handleSubmit} className="btn-primary">
          Submit Information
        </button>
      </div>
    </div>
  )
}

