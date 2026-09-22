import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import CloudBackground from '../../components/portal/CloudBackground'
import ThemeToggle from '../../components/portal/ThemeToggle'
import WelcomeStep from './steps/WelcomeStep'
import ConsentStep from './steps/ConsentStep'
import DataEntryStep from './steps/DataEntryStep'
import DocumentsStep from './steps/DocumentsStep'
import SocialMediaStep from './steps/SocialMediaStep'
import ReviewStep from './steps/ReviewStep'
import ConfirmationStep from './steps/ConfirmationStep'
import './CandidatePortal.css'

export type PortalStep = 
  | 'welcome'
  | 'consent'
  | 'data-entry'
  | 'documents'
  | 'social-media'
  | 'review'
  | 'confirmation'

interface InvitationDetails {
  employerName: string
  orderReference: string
  candidateEmail: string
  candidateId: number
  packageId: number
}

export default function CandidatePortal() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  
  const [currentStep, setCurrentStep] = useState<PortalStep>('welcome')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [candidateId, setCandidateId] = useState<number | null>(null)

  const steps: { key: PortalStep; label: string }[] = [
    { key: 'welcome', label: 'Identity Verification' },
    { key: 'consent', label: 'Consent & Authorization' },
    { key: 'data-entry', label: 'Personal Information' },
    { key: 'documents', label: 'Document Upload' },
    { key: 'social-media', label: 'Social Media (Optional)' },
    { key: 'review', label: 'Review & Submit' },
  ]

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired invitation link. Please contact your employer for a new invitation.')
      setIsLoading(false)
      return
    }

    loadInvitationDetails()
  }, [token])

  const loadInvitationDetails = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/api/candidate-portal/invitation-details?token=${token}`)
      
      setInvitationDetails({
        employerName: response.employerName || 'Your Employer',
        orderReference: response.orderReference || '',
        candidateEmail: response.candidateEmail || '',
        candidateId: response.candidateId || 0,
        packageId: response.packageId || 0
      })
      setCandidateId(response.candidateId || null)
      setIsLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link.')
      setIsLoading(false)
    }
  }

  const handleStepComplete = (nextStep: PortalStep) => {
    setCurrentStep(nextStep)
    // Save progress to localStorage
    localStorage.setItem(`candidate_portal_step_${token}`, nextStep)
  }

  const handleFinalSubmit = () => {
    setCurrentStep('confirmation')
    localStorage.removeItem(`candidate_portal_step_${token}`)
  }

  if (isLoading) {
    return (
      <div className="candidate-portal-wrapper">
        <CloudBackground />
        <div className="candidate-portal-loading">
          <div className="loading-spinner"></div>
          <p>Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (error || !token || !invitationDetails) {
    return (
      <div className="candidate-portal-wrapper">
        <CloudBackground />
        <div className="candidate-portal-error">
          <div className="error-card">
            <h2>Access Denied</h2>
            <p>{error || 'Invalid or expired invitation link.'}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              Please contact your employer for a new invitation link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="candidate-portal-wrapper">
      <CloudBackground />
      
      {/* Header */}
      <header className="candidate-portal-header">
        <div className="candidate-portal-logo">
          <img src="/logo3.png" alt="EvalRight" />
        </div>
        <ThemeToggle />
      </header>

      {/* Progress Bar */}
      <div className="candidate-portal-progress">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`progress-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'active' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="candidate-portal-content">
        {currentStep === 'welcome' && (
          <WelcomeStep
            token={token}
            invitationDetails={invitationDetails}
            onComplete={() => handleStepComplete('consent')}
          />
        )}
        
        {currentStep === 'consent' && (
          <ConsentStep
            token={token}
            candidateId={candidateId!}
            onComplete={() => handleStepComplete('data-entry')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}
        
        {currentStep === 'data-entry' && (
          <DataEntryStep
            token={token}
            candidateId={candidateId!}
            onComplete={() => handleStepComplete('documents')}
            onBack={() => setCurrentStep('consent')}
          />
        )}
        
        {currentStep === 'documents' && (
          <DocumentsStep
            token={token}
            candidateId={candidateId!}
            onComplete={() => handleStepComplete('social-media')}
            onBack={() => setCurrentStep('data-entry')}
          />
        )}
        
        {currentStep === 'social-media' && (
          <SocialMediaStep
            token={token}
            candidateId={candidateId!}
            onComplete={() => handleStepComplete('review')}
            onBack={() => setCurrentStep('documents')}
            onSkip={() => handleStepComplete('review')}
          />
        )}
        
        {currentStep === 'review' && (
          <ReviewStep
            token={token}
            candidateId={candidateId!}
            onComplete={handleFinalSubmit}
            onBack={() => setCurrentStep('social-media')}
          />
        )}
        
        {currentStep === 'confirmation' && (
          <ConfirmationStep
            employerName={invitationDetails.employerName}
          />
        )}
      </main>
    </div>
  )
}

