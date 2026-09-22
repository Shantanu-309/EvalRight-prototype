import { useState, useEffect } from 'react'
import './register-forms.css'

interface RegisterFormIndividualProps {
  formData: {
    fullName: string
    email: string
    phoneNumber: string
    username: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }
  onInputChange: (field: string, value: string | boolean) => void
  onSubmit: (e: React.FormEvent) => void
}

export default function RegisterFormIndividual({ formData, onInputChange, onSubmit }: RegisterFormIndividualProps) {
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
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phoneNumber.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms
    )
  }

  return (
    <form onSubmit={onSubmit} className="register-form">
      <div className="form-group">
        <label htmlFor="individualFullName" className="form-label">
          Full Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="individualFullName"
          className="form-input"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => onInputChange('fullName', e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="individualEmail" className="form-label">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          id="individualEmail"
          className="form-input"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="individualPhone" className="form-label">
          Phone Number <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="individualPhone"
          className="form-input"
          placeholder="+1 (555) 123-4567"
          value={formData.phoneNumber}
          onChange={(e) => onInputChange('phoneNumber', e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="individualUsername" className="form-label">
          Username <span className="required">*</span>
        </label>
        <input
          type="text"
          id="individualUsername"
          className="form-input"
          placeholder="johndoe"
          value={formData.username}
          onChange={(e) => onInputChange('username', e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="individualPassword" className="form-label">
          Password <span className="required">*</span>
        </label>
        <input
          type="password"
          id="individualPassword"
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
        <label htmlFor="confirmIndividualPassword" className="form-label">
          Confirm Password <span className="required">*</span>
        </label>
        <input
          type="password"
          id="confirmIndividualPassword"
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

      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="acceptIndividualTerms"
            className="form-checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => onInputChange('acceptTerms', e.target.checked)}
            required
            aria-required="true"
          />
          <label htmlFor="acceptIndividualTerms" className="checkbox-label">
            I accept the Terms & Conditions <span className="required">*</span>
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

      <button
        type="submit"
        className="auth-submit-btn register-submit-btn"
        data-variant="purple"
        disabled={!isFormValid()}
      >
        Register
      </button>
    </form>
  )
}

