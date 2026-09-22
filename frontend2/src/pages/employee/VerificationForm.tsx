import { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import '../client-portal/shared.css'
import '../client-portal/orders/orders.css'

interface VerificationFormProps {
  token: string
  candidateId: number
  orderId: number | null
  employerName: string
}

export default function VerificationForm({ token, candidateId, orderId, employerName }: VerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Section states
  const [identityData, setIdentityData] = useState({
    fullName: '',
    dob: '',
    idType: '',
    idNumber: '',
    idDocumentFront: null as File | null,
    idDocumentBack: null as File | null,
  })

  const [addresses, setAddresses] = useState([{
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    fromDate: '',
    toDate: '',
    isCurrent: true,
  }])

  const [educations, setEducations] = useState([{
    institutionName: '',
    degree: '',
    graduationYear: '',
    modeOfStudy: '',
    certificate: null as File | null,
  }])

  const [employments, setEmployments] = useState([{
    employerName: '',
    jobTitle: '',
    fromDate: '',
    toDate: '',
    reasonForLeaving: '',
    experienceLetter: null as File | null,
  }])

  const [criminalData, setCriminalData] = useState({
    hasConvictions: '',
    caseType: '',
    year: '',
    jurisdiction: '',
    supportingDocument: null as File | null,
  })

  const [workAuth, setWorkAuth] = useState({
    authorizationType: '',
    expiryDate: '',
    permitDocument: null as File | null,
  })

  const [drugTest, setDrugTest] = useState({
    testType: '',
    labName: '',
    testDate: '',
    testReport: null as File | null,
  })

  const [socialMedia, setSocialMedia] = useState({
    linkedIn: '',
    github: '',
    instagram: '',
    facebook: '',
    portfolio: '',
    profilesBelongToMe: false,
  })

  const [references, setReferences] = useState([{
    name: '',
    relationship: '',
    email: '',
    phone: '',
    consent: false,
  }])

  const [consentData, setConsentData] = useState({
    fcraText: '',
    signature: '',
    infoAccurate: false,
    consentBackgroundCheck: false,
    consentThirdParty: false,
  })

  const [fcraScrolled, setFcraScrolled] = useState(false)
  const fcraContainerRef = useRef<HTMLDivElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Temporarily disabled - Section 10 removed for testing
  // useEffect(() => {
  //   loadFcraText()
  // }, [])

  // useEffect(() => {
  //   const container = fcraContainerRef.current
  //   if (!container) return

  //   const handleScroll = () => {
  //     const { scrollTop, scrollHeight, clientHeight } = container
  //     if (scrollTop + clientHeight >= scrollHeight - 10) {
  //       setFcraScrolled(true)
  //     }
  //   }

  //   container.addEventListener('scroll', handleScroll)
  //   return () => container.removeEventListener('scroll', handleScroll)
  // }, [])

  // const loadFcraText = async () => {
  //   try {
  //     const response = await api.get('/api/candidate-portal/legal/fcra')
  //     setConsentData(prev => ({ ...prev, fcraText: response.text || '' }))
  //   } catch (err) {
  //     console.error('Failed to load FCRA text:', err)
  //   }
  // }

  const handleFileUpload = async (file: File, documentType: string): Promise<number> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('token', token)
      formData.append('candidateId', candidateId.toString())

      // Map document types to endpoints
      const endpointMap: Record<string, string> = {
        'id-proof-front': '/candidate/file/id-proof-front',
        'id-proof-back': '/candidate/file/id-proof-back',
        'diploma': '/candidate/file/diploma',
        'experience-letter': '/candidate/file/experience-letter',
        'criminal': '/candidate/file/criminal',
        'work-auth': '/candidate/file/work-auth',
        'drug-test': '/candidate/file/drug-test',
      }

      const endpoint = endpointMap[documentType] || '/candidate/file/diploma'
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5274/api'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'File upload failed' }))
        throw new Error(error.message || 'File upload failed')
      }

      const result = await response.json()
      return result.fileId || 0
    } catch (err: any) {
      console.error(`Error uploading file ${documentType}:`, err)
      throw new Error(`Failed to upload ${documentType}: ${err.message || 'Unknown error'}`)
    }
  }


  const handleSectionSubmit = async (sectionType: string, data: any) => {
    try {
      // Map section types to /candidate/data/* endpoints
      const endpointMap: Record<string, string> = {
        'IDENTITY': '/candidate/data/pii',
        'ADDRESS_HISTORY': '/candidate/data/address',
        'EDUCATION': '/candidate/data/education',
        'EMPLOYMENT': '/candidate/data/employment',
        'CRIMINAL': '/candidate/data/criminal',
        'WORK_AUTHORIZATION': '/candidate/data/work-auth',
        'DRUG_TEST': '/candidate/data/drug-test',
        'SOCIAL_MEDIA': '/candidate/data/social-media',
        'REFERENCES': '/candidate/data/references',
      }

      const endpoint = endpointMap[sectionType]
      if (!endpoint) {
        throw new Error(`Unknown section type: ${sectionType}`)
      }

      const payload = {
        candidateId,
        ...data,
      }
      
      console.log(`Submitting ${sectionType} to ${endpoint}:`, payload)
      
      const response = await api.post(endpoint, payload)
      console.log(`${sectionType} saved successfully:`, response)
    } catch (err: any) {
      console.error(`Error saving ${sectionType}:`, err)
      const errorMessage = err.message || err.response?.data?.message || `Failed to save ${sectionType}`
      throw new Error(errorMessage)
    }
  }

  const handleFinalSubmit = async () => {
    // Temporarily removed Section 10 validation - for testing only
    // if (!consentData.signature || !consentData.infoAccurate || !consentData.consentBackgroundCheck) {
    //   setSubmitError('Please complete all required fields including signature and consent checkboxes.')
    //   return
    // }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Prepare submission payload for logging
      const submissionPayload = {
        identity: identityData,
        addresses: addresses,
        educations: educations,
        employments: employments,
        criminal: criminalData,
        workAuth: workAuth,
        drugTest: drugTest,
        socialMedia: socialMedia,
        references: references,
        // consent: consentData, // Temporarily excluded
      }

      // Log full payload being sent to backend
      console.log('=== Verification Form Submission Payload ===')
      console.log(JSON.stringify(submissionPayload, null, 2))
      console.log('===========================================')

      // Upload all files first, then include fileIds in JSON payload
      const identityDataWithFileMetadata: any = { ...identityData }
      
      // Upload ID front document
      if (identityData.idDocumentFront) {
        try {
          const fileId = await handleFileUpload(identityData.idDocumentFront, 'id-proof-front')
          identityDataWithFileMetadata.idDocumentFront = `file_${fileId}`
        } catch (err: any) {
          console.error('Failed to upload ID front document:', err)
          throw new Error(`Failed to upload ID front document: ${err.message}`)
        }
      }
      
      // Upload ID back document
      if (identityData.idDocumentBack) {
        try {
          const fileId = await handleFileUpload(identityData.idDocumentBack, 'id-proof-back')
          identityDataWithFileMetadata.idDocumentBack = `file_${fileId}`
        } catch (err: any) {
          console.error('Failed to upload ID back document:', err)
          throw new Error(`Failed to upload ID back document: ${err.message}`)
        }
      }

      // Submit all sections using task codes (Section 10/CONSENT excluded)
      // Only submit sections that have data to avoid errors
      
      // Identity section - always required
      await handleSectionSubmit('IDENTITY', identityDataWithFileMetadata)
      
      // Address section - only if has valid data
      const validAddresses = addresses.filter(addr => addr.addressLine1 && addr.city && addr.state && addr.postalCode)
      if (validAddresses.length > 0) {
        await handleSectionSubmit('ADDRESS_HISTORY', { addresses: validAddresses })
      }
      
      // Education section - only if has valid data
      // Upload education certificates first
      const validEducations = []
      for (const edu of educations) {
        if (edu.institutionName && edu.degree && edu.graduationYear) {
          const eduData: any = { ...edu }
          // Upload certificate if provided
          if (edu.certificate) {
            try {
              const fileId = await handleFileUpload(edu.certificate, 'diploma')
              eduData.certificate = `file_${fileId}`
            } catch (err: any) {
              console.warn('Failed to upload education certificate:', err)
              delete eduData.certificate
            }
          } else {
            delete eduData.certificate // Remove File object
          }
          validEducations.push(eduData)
        }
      }
      if (validEducations.length > 0) {
        await handleSectionSubmit('EDUCATION', { educations: validEducations })
      }
      
      // Employment section - only if has valid data
      // Upload experience letters first
      const validEmployments = []
      for (const emp of employments) {
        if (emp.employerName && emp.jobTitle && emp.fromDate) {
          const empData: any = { ...emp }
          // Upload experience letter if provided
          if (emp.experienceLetter) {
            try {
              const fileId = await handleFileUpload(emp.experienceLetter, 'experience-letter')
              empData.experienceLetter = `file_${fileId}`
            } catch (err: any) {
              console.warn('Failed to upload experience letter:', err)
              delete empData.experienceLetter
            }
          } else {
            delete empData.experienceLetter // Remove File object
          }
          validEmployments.push(empData)
        }
      }
      if (validEmployments.length > 0) {
        await handleSectionSubmit('EMPLOYMENT', { employments: validEmployments })
      }
      
      // Criminal section - only if answered
      if (criminalData.hasConvictions && (criminalData.hasConvictions === 'no' || (criminalData.hasConvictions === 'yes' && criminalData.caseType && criminalData.year))) {
        const criminalDataWithFile: any = { ...criminalData }
        if (criminalData.supportingDocument) {
          try {
            const fileId = await handleFileUpload(criminalData.supportingDocument, 'criminal')
            criminalDataWithFile.supportingDocument = `file_${fileId}`
          } catch (err: any) {
            console.warn('Failed to upload criminal document:', err)
            delete criminalDataWithFile.supportingDocument
          }
        } else {
          delete criminalDataWithFile.supportingDocument
        }
        await handleSectionSubmit('CRIMINAL', criminalDataWithFile)
      }
      
      // Work authorization - only if answered
      if (workAuth.authorizationType) {
        const workAuthWithFile: any = { ...workAuth }
        if (workAuth.permitDocument) {
          try {
            const fileId = await handleFileUpload(workAuth.permitDocument, 'work-auth')
            workAuthWithFile.permitDocument = `file_${fileId}`
          } catch (err: any) {
            console.warn('Failed to upload work auth document:', err)
            delete workAuthWithFile.permitDocument
          }
        } else {
          delete workAuthWithFile.permitDocument
        }
        await handleSectionSubmit('WORK_AUTHORIZATION', workAuthWithFile)
      }
      
      // Drug test - only if answered
      if (drugTest.testType && drugTest.labName && drugTest.testDate) {
        const drugTestWithFile: any = { ...drugTest }
        if (drugTest.testReport) {
          try {
            const fileId = await handleFileUpload(drugTest.testReport, 'drug-test')
            drugTestWithFile.testReport = `file_${fileId}`
          } catch (err: any) {
            console.warn('Failed to upload drug test report:', err)
            delete drugTestWithFile.testReport
          }
        } else {
          delete drugTestWithFile.testReport
        }
        await handleSectionSubmit('DRUG_TEST', drugTestWithFile)
      }
      
      // Social media - always submit (may be empty)
      await handleSectionSubmit('SOCIAL_MEDIA', socialMedia)
      
      // References - only if has valid data
      const validReferences = references.filter(ref => ref.name && ref.email)
      if (validReferences.length > 0) {
        await handleSectionSubmit('REFERENCES', { references: validReferences })
      }
      // await handleSectionSubmit('CONSENT', consentData) // Temporarily excluded

      // Submit final using JSON (not FormData)
      const finalPayload = {
        token,
        candidateId
      }
      
      console.log('=== Final Submit Payload ===')
      console.log(JSON.stringify(finalPayload, null, 2))
      console.log('===========================')

      const result = await api.post('/candidate/submit/final', finalPayload)
      console.log('=== Final Submit Response ===')
      console.log(JSON.stringify(result, null, 2))
      console.log('=============================')

      setSubmitSuccess(true)
    } catch (err: any) {
      console.error('=== Final Submit Error ===', err)
      let errorMessage = 'Failed to submit verification. Please try again.'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="portal-card">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h1 className="portal-page-title" style={{ marginBottom: '1rem' }}>Verification Submitted</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
            Your verification has been submitted successfully. {employerName} will review your information.
          </p>
          <button onClick={() => window.location.href = '/'} className="submit-button">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-page">
      {/* Page Header */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">Employee Verification Form</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
          You've been invited by <strong>{employerName}</strong> to complete your background verification.
          {orderId && <span> Order Reference: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{orderId}</code></span>}
        </p>
      </div>

      {submitError && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.5)', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#ef4444'
        }}>
          {submitError}
        </div>
      )}

      {/* Form Sections - Single Scrollable Page */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: Identity & Government ID */}
        <SectionCard title="1. Identity & Government ID Verification">
          <div className="order-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={identityData.fullName}
                  onChange={(e) => setIdentityData({ ...identityData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={identityData.dob}
                  onChange={(e) => setIdentityData({ ...identityData, dob: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Government ID Type *</label>
                <select
                  value={identityData.idType}
                  onChange={(e) => setIdentityData({ ...identityData, idType: e.target.value })}
                  required
                >
                  <option value="">Select ID Type</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="pan">PAN</option>
                  <option value="drivers-license">Driver's License</option>
                  <option value="voter-id">Voter ID</option>
                  <option value="birth-certificate">Birth Certificate</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  value={identityData.idNumber}
                  onChange={(e) => setIdentityData({ ...identityData, idNumber: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>ID Document (Front) *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setIdentityData({ ...identityData, idDocumentFront: e.target.files?.[0] || null })}
                  required
                />
              </div>
              {(identityData.idType === 'aadhaar' || identityData.idType === 'drivers-license' || identityData.idType === 'pan') && (
                <div className="form-group">
                  <label>ID Document (Back)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setIdentityData({ ...identityData, idDocumentBack: e.target.files?.[0] || null })}
                  />
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Section 2: Address & Residency History */}
        <SectionCard title="2. Address & Residency History">
          <AddressHistorySection
            addresses={addresses}
            setAddresses={setAddresses}
          />
        </SectionCard>

        {/* Section 3: Education Verification */}
        <SectionCard title="3. Education Verification">
          <EducationSection
            educations={educations}
            setEducations={setEducations}
          />
        </SectionCard>

        {/* Section 4: Employment Verification */}
        <SectionCard title="4. Employment Verification">
          <EmploymentSection
            employments={employments}
            setEmployments={setEmployments}
          />
        </SectionCard>

        {/* Section 5: Criminal Self-Disclosure */}
        <SectionCard title="5. Criminal Self-Disclosure">
          <CriminalSection
            criminalData={criminalData}
            setCriminalData={setCriminalData}
          />
        </SectionCard>

        {/* Section 6: Work Authorization */}
        <SectionCard title="6. Right-to-Work / Visa Status">
          <WorkAuthorizationSection
            workAuth={workAuth}
            setWorkAuth={setWorkAuth}
          />
        </SectionCard>

        {/* Section 7: Drug Screening */}
        <SectionCard title="7. Drug Screening">
          <DrugTestSection
            drugTest={drugTest}
            setDrugTest={setDrugTest}
          />
        </SectionCard>

        {/* Section 8: Social Media */}
        <SectionCard title="8. Social Media & Online Presence">
          <SocialMediaSection
            socialMedia={socialMedia}
            setSocialMedia={setSocialMedia}
          />
        </SectionCard>

        {/* Section 9: References */}
        <SectionCard title="9. References (Optional)">
          <ReferencesSection
            references={references}
            setReferences={setReferences}
          />
        </SectionCard>

        {/* Section 10: Legal Consent - Temporarily removed for testing */}
        {/* <SectionCard title="10. Legal Consent & Declaration">
          <ConsentSection
            consentData={consentData}
            setConsentData={setConsentData}
            fcraScrolled={fcraScrolled}
            fcraContainerRef={fcraContainerRef}
            signatureCanvasRef={signatureCanvasRef}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            token={token}
          />
        </SectionCard> */}

        {/* Submit Button */}
        <div className="portal-card" style={{ borderLeft: 'none', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleFinalSubmit}
              className="submit-button"
              disabled={isSubmitting}
              style={{ minWidth: '200px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for section cards
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="portal-card">
      <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>{title}</h2>
      {children}
    </div>
  )
}

// Section Components - Full Implementations

function AddressHistorySection({ addresses, setAddresses }: any) {
  const addAddress = () => {
    setAddresses([...addresses, {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      fromDate: '',
      toDate: '',
      isCurrent: false,
    }])
  }

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index))
    }
  }

  const updateAddress = (index: number, field: string, value: any) => {
    const updated = [...addresses]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'isCurrent' && value === true) {
      updated[index].toDate = ''
    }
    setAddresses(updated)
  }

  return (
    <div className="order-form">
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Please provide your address history for the last 7 years:
      </p>
      {addresses.map((address: any, index: number) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{address.isCurrent ? 'Current Address' : `Previous Address ${index}`}</h3>
            {addresses.length > 1 && (
              <button type="button" onClick={() => removeAddress(index)} className="action-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Remove
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Address Line 1 *</label>
            <input
              type="text"
              value={address.addressLine1}
              onChange={(e) => updateAddress(index, 'addressLine1', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Address Line 2</label>
            <input
              type="text"
              value={address.addressLine2}
              onChange={(e) => updateAddress(index, 'addressLine2', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => updateAddress(index, 'city', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => updateAddress(index, 'state', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Postal Code *</label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => updateAddress(index, 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              value={address.country}
              onChange={(e) => updateAddress(index, 'country', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>From Date *</label>
              <input
                type="date"
                value={address.fromDate}
                onChange={(e) => updateAddress(index, 'fromDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{address.isCurrent ? 'To Date (Leave empty if current)' : 'To Date *'}</label>
              <input
                type="date"
                value={address.toDate}
                onChange={(e) => updateAddress(index, 'toDate', e.target.value)}
                disabled={address.isCurrent}
                required={!address.isCurrent}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={address.isCurrent}
                onChange={(e) => updateAddress(index, 'isCurrent', e.target.checked)}
              />
              {' '}This is my current address
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={addAddress} className="action-button" style={{ marginTop: '0.5rem' }}>
        + Add Previous Address
      </button>
    </div>
  )
}

function EducationSection({ educations, setEducations }: any) {
  const addEducation = () => {
    setEducations([...educations, {
      institutionName: '',
      degree: '',
      graduationYear: '',
      modeOfStudy: '',
      certificate: null,
    }])
  }

  const removeEducation = (index: number) => {
    if (educations.length > 1) {
      setEducations(educations.filter((_, i) => i !== index))
    }
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...educations]
    updated[index] = { ...updated[index], [field]: value }
    setEducations(updated)
  }

  return (
    <div className="order-form">
      {educations.map((edu: any, index: number) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Education {index + 1}</h3>
            {educations.length > 1 && (
              <button type="button" onClick={() => removeEducation(index)} className="action-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Remove
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Institution Name *</label>
            <input
              type="text"
              value={edu.institutionName}
              onChange={(e) => updateEducation(index, 'institutionName', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                required
                placeholder="e.g., Bachelor's, Master's"
              />
            </div>
            <div className="form-group">
              <label>Graduation Year *</label>
              <input
                type="number"
                value={edu.graduationYear}
                onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                required
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mode of Study *</label>
            <select
              value={edu.modeOfStudy}
              onChange={(e) => updateEducation(index, 'modeOfStudy', e.target.value)}
              required
            >
              <option value="">Select Mode</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="distance">Distance Learning</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="form-group">
            <label>Upload Degree / Certificate *</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => updateEducation(index, 'certificate', e.target.files?.[0] || null)}
              required
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="action-button" style={{ marginTop: '0.5rem' }}>
        + Add Another Education
      </button>
    </div>
  )
}

function EmploymentSection({ employments, setEmployments }: any) {
  const addEmployment = () => {
    setEmployments([...employments, {
      employerName: '',
      jobTitle: '',
      fromDate: '',
      toDate: '',
      reasonForLeaving: '',
      experienceLetter: null,
    }])
  }

  const removeEmployment = (index: number) => {
    if (employments.length > 1) {
      setEmployments(employments.filter((_, i) => i !== index))
    }
  }

  const updateEmployment = (index: number, field: string, value: any) => {
    const updated = [...employments]
    updated[index] = { ...updated[index], [field]: value }
    setEmployments(updated)
  }

  return (
    <div className="order-form">
      {employments.map((emp: any, index: number) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Employment {index + 1}</h3>
            {employments.length > 1 && (
              <button type="button" onClick={() => removeEmployment(index)} className="action-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Remove
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Employer Name *</label>
              <input
                type="text"
                value={emp.employerName}
                onChange={(e) => updateEmployment(index, 'employerName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                value={emp.jobTitle}
                onChange={(e) => updateEmployment(index, 'jobTitle', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>From Date *</label>
              <input
                type="date"
                value={emp.fromDate}
                onChange={(e) => updateEmployment(index, 'fromDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>To Date *</label>
              <input
                type="date"
                value={emp.toDate}
                onChange={(e) => updateEmployment(index, 'toDate', e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reason for Leaving</label>
            <input
              type="text"
              value={emp.reasonForLeaving}
              onChange={(e) => updateEmployment(index, 'reasonForLeaving', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Upload Experience Letter (Optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => updateEmployment(index, 'experienceLetter', e.target.files?.[0] || null)}
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addEmployment} className="action-button" style={{ marginTop: '0.5rem' }}>
        + Add Another Employment
      </button>
    </div>
  )
}

function CriminalSection({ criminalData, setCriminalData }: any) {
  return (
    <div className="order-form">
      <div className="form-group">
        <label>Criminal conviction history? *</label>
        <select
          value={criminalData.hasConvictions}
          onChange={(e) => setCriminalData({ ...criminalData, hasConvictions: e.target.value })}
          required
        >
          <option value="">Select</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {criminalData.hasConvictions === 'yes' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Case Type *</label>
              <input
                type="text"
                value={criminalData.caseType}
                onChange={(e) => setCriminalData({ ...criminalData, caseType: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                value={criminalData.year}
                onChange={(e) => setCriminalData({ ...criminalData, year: e.target.value })}
                required
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Jurisdiction *</label>
            <input
              type="text"
              value={criminalData.jurisdiction}
              onChange={(e) => setCriminalData({ ...criminalData, jurisdiction: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Supporting Document (Optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setCriminalData({ ...criminalData, supportingDocument: e.target.files?.[0] || null })}
            />
          </div>
        </>
      )}
    </div>
  )
}

function WorkAuthorizationSection({ workAuth, setWorkAuth }: any) {
  return (
    <div className="order-form">
      <div className="form-group">
        <label>Work Authorization Type *</label>
        <select
          value={workAuth.authorizationType}
          onChange={(e) => setWorkAuth({ ...workAuth, authorizationType: e.target.value })}
          required
        >
          <option value="">Select Type</option>
          <option value="citizen">Citizen</option>
          <option value="permanent-resident">Permanent Resident</option>
          <option value="work-visa">Work Visa</option>
          <option value="student-visa">Student Visa</option>
        </select>
      </div>

      {(workAuth.authorizationType === 'work-visa' || workAuth.authorizationType === 'student-visa') && (
        <>
          <div className="form-group">
            <label>Expiry Date *</label>
            <input
              type="date"
              value={workAuth.expiryDate}
              onChange={(e) => setWorkAuth({ ...workAuth, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Permit/Visa Document *</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setWorkAuth({ ...workAuth, permitDocument: e.target.files?.[0] || null })}
              required
            />
          </div>
        </>
      )}
    </div>
  )
}

function DrugTestSection({ drugTest, setDrugTest }: any) {
  return (
    <div className="order-form">
      <div className="form-group">
        <label>Drug Test Type *</label>
        <select
          value={drugTest.testType}
          onChange={(e) => setDrugTest({ ...drugTest, testType: e.target.value })}
          required
        >
          <option value="">Select Type</option>
          <option value="pre-employment">Pre-Employment</option>
          <option value="random">Random</option>
          <option value="post-incident">Post-Incident</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Lab Name *</label>
          <input
            type="text"
            value={drugTest.labName}
            onChange={(e) => setDrugTest({ ...drugTest, labName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Test Date *</label>
          <input
            type="date"
            value={drugTest.testDate}
            onChange={(e) => setDrugTest({ ...drugTest, testDate: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Upload Drug Test Report *</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setDrugTest({ ...drugTest, testReport: e.target.files?.[0] || null })}
          required
        />
      </div>
    </div>
  )
}

function SocialMediaSection({ socialMedia, setSocialMedia }: any) {
  return (
    <div className="order-form">
      <div className="form-group">
        <label>LinkedIn URL *</label>
        <input
          type="url"
          value={socialMedia.linkedIn}
          onChange={(e) => setSocialMedia({ ...socialMedia, linkedIn: e.target.value })}
          required
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className="form-group">
        <label>GitHub URL (Optional)</label>
        <input
          type="url"
          value={socialMedia.github}
          onChange={(e) => setSocialMedia({ ...socialMedia, github: e.target.value })}
          placeholder="https://github.com/yourusername"
        />
      </div>

      <div className="form-group">
        <label>Instagram URL (Optional)</label>
        <input
          type="url"
          value={socialMedia.instagram}
          onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
          placeholder="https://instagram.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label>Facebook URL (Optional)</label>
        <input
          type="url"
          value={socialMedia.facebook}
          onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
          placeholder="https://facebook.com/yourprofile"
        />
      </div>

      <div className="form-group">
        <label>Portfolio / Website URL (Optional)</label>
        <input
          type="url"
          value={socialMedia.portfolio}
          onChange={(e) => setSocialMedia({ ...socialMedia, portfolio: e.target.value })}
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={socialMedia.profilesBelongToMe}
            onChange={(e) => setSocialMedia({ ...socialMedia, profilesBelongToMe: e.target.checked })}
            required
          />
          {' '}I confirm these profiles belong to me *
        </label>
      </div>
    </div>
  )
}

function ReferencesSection({ references, setReferences }: any) {
  const addReference = () => {
    setReferences([...references, {
      name: '',
      relationship: '',
      email: '',
      phone: '',
      consent: false,
    }])
  }

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
  }

  const updateReference = (index: number, field: string, value: any) => {
    const updated = [...references]
    updated[index] = { ...updated[index], [field]: value }
    setReferences(updated)
  }

  return (
    <div className="order-form">
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Provide professional or personal references (optional):
      </p>
      {references.map((ref: any, index: number) => (
        <div key={index} style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Reference {index + 1}</h3>
            <button type="button" onClick={() => removeReference(index)} className="action-button" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Remove
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Reference Name</label>
              <input
                type="text"
                value={ref.name}
                onChange={(e) => updateReference(index, 'name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                value={ref.relationship}
                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                placeholder="e.g., Former Manager, Colleague"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={ref.email}
                onChange={(e) => updateReference(index, 'email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={ref.phone}
                onChange={(e) => updateReference(index, 'phone', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={ref.consent}
                onChange={(e) => updateReference(index, 'consent', e.target.checked)}
              />
              {' '}Reference has given consent to be contacted
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={addReference} className="action-button" style={{ marginTop: '0.5rem' }}>
        + Add Reference
      </button>
    </div>
  )
}

function ConsentSection({ consentData, setConsentData, fcraScrolled, fcraContainerRef, signatureCanvasRef, isDrawing, setIsDrawing, token }: any) {
  useEffect(() => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let lastX = 0
    let lastY = 0

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      setIsDrawing(true)
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      lastX = clientX - rect.left
      lastY = clientY - rect.top
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const currentX = clientX - rect.left
      const currentY = clientY - rect.top

      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()

      lastX = currentX
      lastY = currentY
      
      setConsentData((prev: any) => ({ ...prev, signature: canvas.toDataURL() }))
    }

    const stopDrawing = () => {
      setIsDrawing(false)
      if (canvas) {
        setConsentData((prev: any) => ({ ...prev, signature: canvas.toDataURL() }))
      }
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)
    canvas.addEventListener('touchstart', startDrawing)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [signatureCanvasRef, isDrawing, setIsDrawing, setConsentData])

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setConsentData((prev: any) => ({ ...prev, signature: '' }))
      }
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get('/candidate-portal/consent/download', {
        params: { token: consentData.token },
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'fcra-consent.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to download consent:', err)
    }
  }

  return (
    <div className="order-form">
      {/* FCRA Disclosure */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>FCRA Disclosure</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Please read the following disclosure carefully. You must scroll to the end to continue.
        </p>
        
        <div 
          ref={fcraContainerRef}
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '0.5rem',
            border: fcraScrolled ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '1rem',
          }}
        >
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
            {consentData.fcraText}
          </pre>
        </div>
        
        {fcraScrolled && (
          <p style={{ 
            padding: '0.75rem', 
            background: 'rgba(34, 197, 94, 0.2)', 
            border: '1px solid rgba(34, 197, 94, 0.5)', 
            borderRadius: '0.5rem',
            color: '#22c55e',
            fontSize: '0.9rem',
            marginBottom: '1.5rem'
          }}>
            ✓ You have read the disclosure
          </p>
        )}
      </div>

      {/* E-Signature */}
      {fcraScrolled && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>E-Signature</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Please sign below using your mouse or touch screen:
          </p>

          <div>
            <canvas
              ref={signatureCanvasRef}
              width={600}
              height={200}
              style={{
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'crosshair',
                width: '100%',
                maxWidth: '600px',
              }}
            />
            <button 
              type="button" 
              onClick={clearSignature}
              className="action-button"
              style={{ marginTop: '0.75rem' }}
            >
              Clear Signature
            </button>
            {consentData.signature && (
              <button 
                type="button" 
                onClick={handleDownload}
                className="action-button"
                style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
              >
                Download PDF
              </button>
            )}
          </div>
        </div>
      )}

      {/* Consent Checkboxes */}
      {fcraScrolled && consentData.signature && (
        <div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={consentData.infoAccurate}
                onChange={(e) => setConsentData({ ...consentData, infoAccurate: e.target.checked })}
                required
              />
              {' '}I confirm that all information provided is accurate *
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={consentData.consentBackgroundCheck}
                onChange={(e) => setConsentData({ ...consentData, consentBackgroundCheck: e.target.checked })}
                required
              />
              {' '}I consent to background checks *
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={consentData.consentThirdParty}
                onChange={(e) => setConsentData({ ...consentData, consentThirdParty: e.target.checked })}
                required
              />
              {' '}I consent to third-party verification *
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

