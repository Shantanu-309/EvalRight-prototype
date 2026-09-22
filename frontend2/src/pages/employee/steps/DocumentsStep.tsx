import { useState } from 'react'
import api from '../../../services/api'

interface DocumentsStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function DocumentsStep({ state, onComplete, onBack, error, setError }: DocumentsStepProps) {
  const [idProof, setIdProof] = useState<File | null>(null)
  const [diploma, setDiploma] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [idProofUrl, setIdProofUrl] = useState<string | null>(null)
  const [diplomaUrl, setDiplomaUrl] = useState<string | null>(null)

  const handleFileChange = (type: 'id' | 'diploma', file: File | null) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    if (type === 'id') {
      setIdProof(file)
      const url = URL.createObjectURL(file)
      setIdProofUrl(url)
    } else {
      setDiploma(file)
      const url = URL.createObjectURL(file)
      setDiplomaUrl(url)
    }
    setError(null)
  }

  const handleUpload = async (type: 'id' | 'diploma', file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('candidateId', state.candidateId.toString())
    formData.append('token', state.token || '')

    try {
      const endpoint = type === 'id' 
        ? '/api/candidate-portal/file/id-proof'
        : '/api/candidate-portal/file/diploma'
      
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.fileId
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to upload file')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUploading(true)

    try {
      const uploadedFiles: any = {}

      if (idProof) {
        uploadedFiles.idProofId = await handleUpload('id', idProof)
      }

      if (diploma) {
        uploadedFiles.diplomaId = await handleUpload('diploma', diploma)
      }

      onComplete(uploadedFiles)
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="documents-step">
      <h1>Document Upload</h1>
      <p>Please upload the required documents:</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="step-form">
        <div className="document-upload-section" style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <h3>ID Proof *</h3>
          <p>Upload a valid government-issued ID (Driver's License, Passport, etc.)</p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Accepted formats: JPEG, PNG, PDF (Max 10MB)
          </p>
          
          <div className="file-upload-area" style={{
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '1rem',
            cursor: 'pointer',
          }}>
            <input
              type="file"
              id="id-proof"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => handleFileChange('id', e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <label htmlFor="id-proof" style={{ cursor: 'pointer' }}>
              {idProof ? (
                <div>
                  <p>✓ {idProof.name}</p>
                  {idProofUrl && idProof.type.startsWith('image/') && (
                    <img src={idProofUrl} alt="ID Preview" style={{ maxWidth: '200px', marginTop: '1rem', borderRadius: '4px' }} />
                  )}
                </div>
              ) : (
                <div>
                  <p>Click to upload or drag and drop</p>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>ID Document</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="document-upload-section" style={{ 
          padding: '1.5rem', 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <h3>Diploma/Certificate (Optional)</h3>
          <p>Upload your degree certificate or diploma</p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Accepted formats: JPEG, PNG, PDF (Max 10MB)
          </p>
          
          <div className="file-upload-area" style={{
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            marginTop: '1rem',
            cursor: 'pointer',
          }}>
            <input
              type="file"
              id="diploma"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => handleFileChange('diploma', e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            <label htmlFor="diploma" style={{ cursor: 'pointer' }}>
              {diploma ? (
                <div>
                  <p>✓ {diploma.name}</p>
                  {diplomaUrl && diploma.type.startsWith('image/') && (
                    <img src={diplomaUrl} alt="Diploma Preview" style={{ maxWidth: '200px', marginTop: '1rem', borderRadius: '4px' }} />
                  )}
                </div>
              ) : (
                <div>
                  <p>Click to upload or drag and drop</p>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Diploma/Certificate</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={!idProof || uploading}>
            {uploading ? 'Uploading...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  )
}

