import { useState, useEffect, useRef } from 'react'
import api from '../../../services/api'
import '../CandidatePortal.css'

interface ConsentStepProps {
  token: string
  candidateId: number
  onComplete: () => void
  onBack: () => void
}

export default function ConsentStep({ token, candidateId, onComplete, onBack }: ConsentStepProps) {
  const [fcraText, setFcraText] = useState('')
  const [hasScrolled, setHasScrolled] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [isSigned, setIsSigned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    loadFcraText()
  }, [])

  const loadFcraText = async () => {
    try {
      const response = await api.get('/candidate-portal/legal/fcra')
      setFcraText(response.text || 'FCRA disclosure text will be displayed here...')
    } catch (err) {
      console.error('Failed to load FCRA text:', err)
      setFcraText('FCRA disclosure text will be displayed here...')
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolled(true)
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const handleSign = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png')
    if (!signatureData || signatureData === canvas.toDataURL()) {
      setError('Please provide your signature')
      return
    }

    try {
      setIsSigning(true)
      setError(null)

      // Get IP address (simplified - in production, get from backend)
      const response = await api.post('/candidate-portal/consent/sign', {
        token,
        candidateId,
        signature: signatureData,
        timestamp: new Date().toISOString(),
        ipAddress: '0.0.0.0' // Backend should capture this
      })

      if (response.success) {
        setSignature(signatureData)
        setIsSigned(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save signature. Please try again.')
    } finally {
      setIsSigning(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/api/candidate-portal/consent/download?token=${token}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'consent-form.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Failed to download consent:', err)
    }
  }

  const handleContinue = () => {
    if (!isSigned) {
      setError('Please sign the consent form before continuing')
      return
    }
    onComplete()
  }

  return (
    <div className="candidate-step-card">
      <div className="step-header">
        <h2>Consent & Authorization</h2>
        <p>Please review and sign the required consent forms</p>
      </div>

      {/* FCRA Disclosure */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>FCRA Disclosure</h3>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {fcraText}
          </div>
        </div>
        {!hasScrolled && (
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
            Please scroll to the end to continue
          </p>
        )}
      </div>

      {/* E-Signature */}
      {hasScrolled && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Electronic Signature</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Please sign below using your mouse or touch screen
          </p>
          
          <div style={{ 
            border: '2px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '8px',
            padding: '1rem',
            background: 'white'
          }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              style={{ 
                width: '100%', 
                height: '200px',
                cursor: 'crosshair',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={clearSignature}>
              Clear
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSign}
              disabled={isSigning || isSigned}
            >
              {isSigning ? 'Signing...' : isSigned ? 'Signed ✓' : 'Sign Consent'}
            </button>
          </div>

          {isSigned && (
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-outline" onClick={handleDownload}>
                Download Signed Consent PDF
              </button>
            </div>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleContinue}
          disabled={!hasScrolled || !isSigned}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

