import { useState, useEffect, useRef } from 'react'
import api from '../../../services/api'

interface ConsentStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function ConsentStep({ state, onComplete, onBack, error, setError }: ConsentStepProps) {
  const [fcraText, setFcraText] = useState('')
  const [hasScrolled, setHasScrolled] = useState(false)
  const [signature, setSignature] = useState<string>('')
  const [isSigning, setIsSigning] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    fetchFcraText()
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolled(true)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    initSignaturePad()
  }, [])

  const fetchFcraText = async () => {
    try {
      const response = await api.get('/candidate-portal/legal/fcra')
      setFcraText(response.text || getDefaultFcraText())
    } catch (err) {
      setFcraText(getDefaultFcraText())
    }
  }

  const getDefaultFcraText = () => {
    return `FAIR CREDIT REPORTING ACT DISCLOSURE

You are hereby notified that a consumer report (background check) may be obtained for employment purposes as part of the pre-employment screening process and/or at any time during your employment.

This report may include information concerning your character, general reputation, personal characteristics, mode of living, credit history, criminal history, driving record, and other information bearing on your credit worthiness, credit standing, credit capacity, character, general reputation, personal characteristics, or mode of living.

The report may be obtained from EvalRight or its designated consumer reporting agency.

You have the right to request additional information about the nature and scope of the investigation. You also have the right to dispute the accuracy or completeness of any information in the report.

By signing below, you acknowledge that you have read and understand this disclosure and authorize the procurement of such reports.`
  }

  const initSignaturePad = () => {
    const canvas = canvasRef.current
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
    }

    const stopDrawing = () => {
      setIsDrawing(false)
      if (canvas) {
        setSignature(canvas.toDataURL())
      }
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)
    canvas.addEventListener('touchstart', startDrawing)
    canvas.addEventListener('touchmove', draw)
    canvas.addEventListener('touchend', stopDrawing)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!hasScrolled) {
      setError('Please scroll to the end of the FCRA disclosure before continuing.')
      return
    }

    if (!signature) {
      setError('Please provide your signature.')
      return
    }

    try {
      setIsSigning(true)
      
      // Submit signature
      const response = await api.post('/candidate-portal/consent/sign', {
        token: state.token,
        candidateId: state.candidateId,
        signature,
        timestamp: new Date().toISOString(),
        ipAddress: await getIpAddress(),
      })

      onComplete({
        signed: true,
        signatureId: response.signatureId,
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save signature. Please try again.')
    } finally {
      setIsSigning(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get('/candidate-portal/consent/download', {
        params: { token: state.token },
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
      setError('Failed to download consent document.')
    }
  }

  const getIpAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setSignature('')
      }
    }
  }

  return (
    <div className="portal-page">
      {/* Page Header - Client Portal Style */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">Consent & Authorization</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
          Please review and sign the required consent forms.
        </p>
      </div>

      {/* Error Alert - Client Portal Style */}
      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.2)', 
          border: '1px solid rgba(239, 68, 68, 0.5)', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* FCRA Disclosure Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>FCRA Disclosure</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Please read the following disclosure carefully. You must scroll to the end to continue.
        </p>
        
        <div 
          ref={scrollContainerRef}
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '0.5rem',
            border: hasScrolled ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '1rem',
          }}
        >
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
            {fcraText}
          </pre>
        </div>
        
        {hasScrolled && (
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

      {/* E-Signature Section */}
      {hasScrolled && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>E-Signature</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Please sign below using your mouse or touch screen:
          </p>

          <div>
            <canvas
              ref={canvasRef}
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
          </div>
        </div>
      )}

      {/* Form Actions */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button type="button" onClick={onBack} className="action-button">
            Back
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {hasScrolled && signature && (
              <button type="button" onClick={handleDownload} className="action-button">
                Download PDF
              </button>
            )}
            <button 
              type="submit"
              className="submit-button" 
              disabled={!hasScrolled || !signature || isSigning}
            >
              {isSigning ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
