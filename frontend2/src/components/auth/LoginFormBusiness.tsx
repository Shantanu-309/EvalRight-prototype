import { Link } from 'react-router-dom'
import './auth-forms.css'

interface LoginFormBusinessProps {
  formData: {
    companyEmail: string
    password: string
  }
  onInputChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
}

export default function LoginFormBusiness({ formData, onInputChange, onSubmit, isLoading = false }: LoginFormBusinessProps) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="companyEmail" className="form-label">
          Company Email
        </label>
        <input
          type="email"
          id="companyEmail"
          className="form-input"
          placeholder="yourcompany@example.com"
          value={formData.companyEmail}
          onChange={(e) => onInputChange('companyEmail', e.target.value)}
          required
          autoComplete="email"
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="businessPassword" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="businessPassword"
          className="form-input"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          required
          autoComplete="current-password"
          aria-required="true"
        />
      </div>

      <div className="form-options">
        <Link to="/forgot-password" className="forgot-password-link">
          Forgot Password?
        </Link>
      </div>

      <button type="submit" className="auth-submit-btn login-submit-btn" data-variant="red" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

