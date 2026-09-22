import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { applicantService, ApplicantDetail } from '../../../services/applicantService'
import './applicants.css'
import '../ClientPortalHome.css'

export default function CandidateProfileCard() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (candidateId) {
      loadApplicantDetail()
    } else {
      setError('Candidate ID is required')
      setIsLoading(false)
    }
  }, [candidateId])

  const loadApplicantDetail = async () => {
    if (!candidateId) return

    try {
      setIsLoading(true)
      setError(null)
      const candidateIdNum = parseInt(candidateId, 10)
      if (isNaN(candidateIdNum)) {
        throw new Error('Invalid candidate ID')
      }
      const data = await applicantService.getApplicantDetail(candidateIdNum)
      setApplicant(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicant details')
      console.error('Error fetching applicant detail:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('completed') || statusLower.includes('clear')) return 'completed'
    if (statusLower.includes('pending') || statusLower.includes('invited')) return 'pending'
    if (statusLower.includes('progress') || statusLower.includes('verification')) return 'processing'
    if (statusLower.includes('adverse') || statusLower.includes('flagged')) return 'error'
    return 'pending'
  }

  if (isLoading) {
    return (
      <div className="portal-page">
        <div className="portal-page-header">
          <h1 className="portal-page-title">Applicant Profile</h1>
          <div className="portal-breadcrumbs">
            <Link to="/client-portal/applicants" className="link">Dashboard</Link>
            <span>/</span>
            <Link to="/client-portal/applicants" className="link">Applicants</Link>
            <span>/</span>
            <span>Profile</span>
          </div>
        </div>
        <div className="portal-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Loading applicant details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !applicant) {
    return (
      <div className="portal-page">
        <div className="portal-page-header">
          <h1 className="portal-page-title">Applicant Profile</h1>
          <div className="portal-breadcrumbs">
            <Link to="/client-portal/applicants" className="link">Dashboard</Link>
            <span>/</span>
            <Link to="/client-portal/applicants" className="link">Applicants</Link>
            <span>/</span>
            <span>Profile</span>
          </div>
        </div>
        <div className="portal-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
              {error || 'Applicant not found'}
            </div>
            <button onClick={() => navigate('/client-portal/applicants')} className="action-button">
              Back to Applicants
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Applicant Profile</h1>
        <div className="portal-breadcrumbs">
          <Link to="/client-portal/applicants" className="link">Dashboard</Link>
          <span>/</span>
          <Link to="/client-portal/applicants" className="link">Applicants</Link>
          <span>/</span>
          <span>{applicant.firstName} {applicant.lastName}</span>
        </div>
      </div>

      <div className="portal-card">
        {/* Basic Information */}
        <div className="profile-grid">
          <div className="profile-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">
                {applicant.firstName} {applicant.middleName ? applicant.middleName + ' ' : ''}{applicant.lastName}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{applicant.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone:</span>
              <span className="info-value">{applicant.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth:</span>
              <span className="info-value">
                {applicant.dateOfBirth ? formatDate(applicant.dateOfBirth) : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Country of Residence:</span>
              <span className="info-value">{applicant.countryOfResidence || 'N/A'}</span>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">Verification Status</h3>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value">
                <span className={`status-badge ${getStatusClass(applicant.status)}`}>
                  {applicant.status}
                </span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Invitation Status:</span>
              <span className="info-value">
                <span className={`status-badge ${getStatusClass(applicant.invitationStatus)}`}>
                  {applicant.invitationStatus}
                </span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Package:</span>
              <span className="info-value">{applicant.packageName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Order Reference:</span>
              <span className="info-value">{applicant.orderReference || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Submitted At:</span>
              <span className="info-value">
                {applicant.finalSubmittedAt ? formatDate(applicant.finalSubmittedAt) : 'Not submitted'}
              </span>
            </div>
          </div>
        </div>

        {/* Address History */}
        {applicant.addresses && applicant.addresses.length > 0 && (
          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h3 className="section-title">Address History</h3>
            <div className="timeline">
              {applicant.addresses.map((address, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>{address.type === 'current' ? 'Current Address' : 'Previous Address'}</strong>
                  <div>
                    {address.addressLine1 && <div>{address.addressLine1}</div>}
                    {address.addressLine2 && <div>{address.addressLine2}</div>}
                    <div>
                      {address.city && <span>{address.city}, </span>}
                      {address.state && <span>{address.state} </span>}
                      {address.postalCode && <span>{address.postalCode}</span>}
                    </div>
                    {address.country && <div>{address.country}</div>}
                    {(address.fromDate || address.toDate) && (
                      <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                        {address.fromDate && `From: ${formatDate(address.fromDate)}`}
                        {address.toDate && ` To: ${formatDate(address.toDate)}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {applicant.educations && applicant.educations.length > 0 && (
          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h3 className="section-title">Education</h3>
            <div className="timeline">
              {applicant.educations.map((edu, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>{edu.institutionName}</strong>
                  {edu.degree && <div>Degree: {edu.degree}</div>}
                  {edu.major && <div>Major: {edu.major}</div>}
                  {edu.country && <div>Country: {edu.country}</div>}
                  {(edu.fromDate || edu.toDate) && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      {edu.fromDate && `From: ${formatDate(edu.fromDate)}`}
                      {edu.toDate && ` To: ${formatDate(edu.toDate)}`}
                    </div>
                  )}
                  {edu.certificateNumber && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      Certificate: {edu.certificateNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employment */}
        {applicant.employments && applicant.employments.length > 0 && (
          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h3 className="section-title">Employment History</h3>
            <div className="timeline">
              {applicant.employments.map((emp, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>{emp.employerName}</strong>
                  {emp.designation && <div>Position: {emp.designation}</div>}
                  {emp.location && <div>Location: {emp.location}</div>}
                  {(emp.fromDate || emp.toDate) && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      {emp.fromDate && `From: ${formatDate(emp.fromDate)}`}
                      {emp.toDate && ` To: ${formatDate(emp.toDate)}`}
                      {emp.isCurrent && <span> (Current)</span>}
                    </div>
                  )}
                  {emp.contactInfo && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      Contact: {emp.contactInfo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media */}
        {applicant.socialMedia && applicant.socialMedia.profiles && applicant.socialMedia.profiles.length > 0 && (
          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h3 className="section-title">Social Media Profiles</h3>
            <div className="timeline">
              {applicant.socialMedia.profiles.map((profile, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>{profile.platform}</strong>
                  <div>
                    <a href={profile.url} target="_blank" rel="noopener noreferrer" className="link">
                      {profile.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {applicant.documents && applicant.documents.length > 0 && (
          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h3 className="section-title">Uploaded Documents</h3>
            <div className="timeline">
              {applicant.documents.map((doc, idx) => (
                <div key={idx} className="timeline-item">
                  <strong>{doc.documentType}</strong>
                  <div>File: {doc.fileName}</div>
                  {doc.fileSize && (
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      Size: {(doc.fileSize / 1024).toFixed(2)} KB
                    </div>
                  )}
                  {doc.uploadedAt && (
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      Uploaded: {formatDate(doc.uploadedAt)}
                    </div>
                  )}
                  {doc.fileUrl && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="link">
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent & Submission Info */}
        <div className="profile-section" style={{ marginTop: '2rem' }}>
          <h3 className="section-title">Consent & Submission</h3>
          <div className="info-item">
            <span className="info-label">Consent Signed:</span>
            <span className="info-value">
              {applicant.consentSigned ? (
                <span className="status-badge completed">Yes</span>
              ) : (
                <span className="status-badge pending">No</span>
              )}
            </span>
          </div>
          {applicant.consentSignedAt && (
            <div className="info-item">
              <span className="info-label">Consent Signed At:</span>
              <span className="info-value">{formatDate(applicant.consentSignedAt)}</span>
            </div>
          )}
          {applicant.finalSubmittedAt && (
            <div className="info-item">
              <span className="info-label">Final Submission:</span>
              <span className="info-value">{formatDate(applicant.finalSubmittedAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="profile-section" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/client-portal/applicants')} 
            className="action-button"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            Back to Applicants
          </button>
        </div>
      </div>
    </div>
  )
}















