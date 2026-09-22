interface ConfirmationStepProps {
  state: any
}

export default function ConfirmationStep({ state }: ConfirmationStepProps) {
  return (
    <div className="confirmation-step" style={{ textAlign: 'center', padding: '3rem' }}>
      <div className="success-icon" style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#4ade80',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem',
        fontSize: '3rem',
      }}>
        ✓
      </div>
      
      <h1>Submission Successful!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.8)' }}>
        Your information has been submitted successfully.
      </p>
      
      <div className="confirmation-details" style={{
        padding: '2rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <p><strong>Employer:</strong> {state.employerName}</p>
        {state.orderId && <p><strong>Order Reference:</strong> {state.orderId}</p>}
        <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
          Your employer has been notified. You will receive updates via email.
        </p>
        <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>
          All information is now locked and cannot be edited.
        </p>
      </div>
    </div>
  )
}

