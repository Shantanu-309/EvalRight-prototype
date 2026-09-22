import { useState } from 'react'

interface SocialMediaStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function SocialMediaStep({ state, onComplete, onBack, error, setError }: SocialMediaStepProps) {
  const [consentGiven, setConsentGiven] = useState(false)
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [twitter, setTwitter] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!consentGiven) {
      setError('Please provide consent to proceed with social media verification.')
      return
    }

    const profiles = []
    if (linkedin) profiles.push({ platform: 'linkedin', url: linkedin })
    if (github) profiles.push({ platform: 'github', url: github })
    if (twitter) profiles.push({ platform: 'twitter', url: twitter })

    if (profiles.length === 0) {
      setError('Please provide at least one social media profile URL.')
      return
    }

    // Validate URLs
    const urlRegex = /^https?:\/\/.+\..+/
    for (const profile of profiles) {
      if (!urlRegex.test(profile.url)) {
        setError(`Please provide a valid URL for ${profile.platform}.`)
        return
      }
    }

    onComplete({
      consentGiven: true,
      profiles,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="social-media-step">
      <h1>Social Media Verification</h1>
      
      <div className="consent-notice" style={{
        padding: '1.5rem',
        background: 'rgba(179, 0, 34, 0.2)',
        border: '1px solid rgba(179, 0, 34, 0.5)',
        borderRadius: '8px',
        marginBottom: '2rem',
      }}>
        <h3>Consent Notice</h3>
        <p>
          This step is <strong>optional</strong> and requires your explicit consent. 
          By providing your social media profiles, you authorize us to verify your 
          public profile information for identity and reputation verification purposes.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Important:</strong> We will <strong>NOT</strong> access private data, 
          request passwords, or scrape personal information. Only publicly available 
          profile information will be reviewed.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              required
            />
            {' '}I consent to social media verification and understand the terms above *
          </label>
        </div>

        <div className="form-group">
          <label>LinkedIn Profile URL *</label>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://www.linkedin.com/in/yourprofile"
            required
          />
        </div>

        <div className="form-group">
          <label>GitHub Profile URL (Optional)</label>
          <input
            type="url"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div className="form-group">
          <label>Twitter/X Profile URL (Optional)</label>
          <input
            type="url"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/yourusername"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={!consentGiven}>
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

