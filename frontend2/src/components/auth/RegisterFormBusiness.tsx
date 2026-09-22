import { useState, useEffect } from 'react'
import './register-forms.css'

interface RegisterFormBusinessProps {
  formData: {
    companyName: string
    legalName: string
    businessEmail: string
    companyPhone: string
    country: string
    industry: string
    website: string
    fullName: string
    designation: string
    workEmail: string
    workPhone: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
    acceptPrivacy: boolean
  }
  onInputChange: (field: string, value: string | boolean) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
}

const countries = [
  'Select Country',
  'United States',
  'United Kingdom',
  'India',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'Brazil',
  'Other'
]

export default function RegisterFormBusiness({ formData, onInputChange, onSubmit, isLoading = false }: RegisterFormBusinessProps) {
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  useEffect(() => {
    const password = formData.password
    if (password.length === 0) {
      setPasswordStrength('weak')
    } else if (password.length < 8) {
      setPasswordStrength('weak')
    } else if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      setPasswordStrength('medium')
    } else if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      setPasswordStrength('strong')
    } else {
      setPasswordStrength('medium')
    }
  }, [formData.password])

  const isFormValid = () => {
    return (
      formData.companyName.trim() !== '' &&
      formData.businessEmail.trim() !== '' &&
      formData.companyPhone.trim() !== '' &&
      formData.country !== '' && formData.country !== 'Select Country' &&
      formData.fullName.trim() !== '' &&
      formData.designation.trim() !== '' &&
      formData.workEmail.trim() !== '' &&
      formData.workPhone.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms &&
      formData.acceptPrivacy
    )
  }

  return (
    <form onSubmit={onSubmit} className="register-form">
      {/* Section 1: Company Details */}
      <div className="form-section">
        <h3 className="form-section-title">Company Details</h3>
        <div className="form-section-content">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              Company Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              className="form-input"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => onInputChange('companyName', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="legalName" className="form-label">
              Legal Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="legalName"
              className="form-input"
              placeholder="Enter legal company name"
              value={formData.legalName}
              onChange={(e) => onInputChange('legalName', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessEmail" className="form-label">
              Registered Business Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="businessEmail"
              className="form-input"
              placeholder="business@company.com"
              value={formData.businessEmail}
              onChange={(e) => onInputChange('businessEmail', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyPhone" className="form-label">
              Company Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="companyPhone"
              className="form-input"
              placeholder="+1 (555) 123-4567"
              value={formData.companyPhone}
              onChange={(e) => onInputChange('companyPhone', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country" className="form-label">
              Country <span className="required">*</span>
            </label>
            <select
              id="country"
              className="form-input form-select"
              value={formData.country}
              onChange={(e) => onInputChange('country', e.target.value)}
              required
              aria-required="true"
            >
              {countries.map((country) => (
                <option key={country} value={country === 'Select Country' ? '' : country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="industry" className="form-label">
              Industry <span className="required">*</span>
            </label>
            <input
              type="text"
              id="industry"
              className="form-input"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) => onInputChange('industry', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website" className="form-label">
              Website <span className="optional">(Optional)</span>
            </label>
            <input
              type="url"
              id="website"
              className="form-input"
              placeholder="https://www.company.com"
              value={formData.website}
              onChange={(e) => onInputChange('website', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Authorized Person Details */}
      <div className="form-section">
        <h3 className="form-section-title">Authorized Person Details</h3>
        <div className="form-section-content">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="designation" className="form-label">
              Designation / Role <span className="required">*</span>
            </label>
            <input
              type="text"
              id="designation"
              className="form-input"
              placeholder="CEO, HR Manager, etc."
              value={formData.designation}
              onChange={(e) => onInputChange('designation', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="workEmail" className="form-label">
              Work Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="workEmail"
              className="form-input"
              placeholder="john.doe@company.com"
              value={formData.workEmail}
              onChange={(e) => onInputChange('workEmail', e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="workPhone" className="form-label">
              Work Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="workPhone"
              className="form-input"
              placeholder="+1 (555) 123-4567"
              value={formData.workPhone}
              onChange={(e) => onInputChange('workPhone', e.target.value)}
              required
              aria-required="true"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Account Credentials */}
      <div className="form-section">
        <h3 className="form-section-title">Account Credentials</h3>
        <div className="form-section-content">
          <div className="form-group">
            <label htmlFor="businessPassword" className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="businessPassword"
              className="form-input"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              required
              aria-required="true"
            />
            <div className="password-strength-indicator">
              <div className={`strength-bar ${passwordStrength}`}>
                <div className="strength-fill"></div>
              </div>
              <span className={`strength-text ${passwordStrength}`}>
                {passwordStrength === 'weak' && 'Weak'}
                {passwordStrength === 'medium' && 'Medium'}
                {passwordStrength === 'strong' && 'Strong'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmBusinessPassword" className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmBusinessPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => onInputChange('confirmPassword', e.target.value)}
              required
              aria-required="true"
            />
            {formData.password !== formData.confirmPassword && formData.confirmPassword !== '' && (
              <span className="error-message">Passwords do not match</span>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Security & Compliance */}
      <div className="form-section">
        <h3 className="form-section-title">Security & Compliance</h3>
        <div className="form-section-content">
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="acceptTerms"
                className="form-checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => onInputChange('acceptTerms', e.target.checked)}
                required
                aria-required="true"
              />
              <label htmlFor="acceptTerms" className="checkbox-label">
                I accept the Terms & Conditions <span className="required">*</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="acceptPrivacy"
                className="form-checkbox"
                checked={formData.acceptPrivacy}
                onChange={(e) => onInputChange('acceptPrivacy', e.target.checked)}
                required
                aria-required="true"
              />
              <label htmlFor="acceptPrivacy" className="checkbox-label">
                I accept the Data Privacy Policy <span className="required">*</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Captcha Verification</label>
            <div className="captcha-placeholder">
              <div className="captcha-box">
                <span>Captcha Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="auth-submit-btn register-submit-btn"
        data-variant="purple"
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

