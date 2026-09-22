import { Link } from 'react-router-dom'
import './auth-forms.css'

interface LoginFormIndividualProps {
  formData: {
    username: string
    password: string
  }
  onInputChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
}

export default function LoginFormIndividual({ formData, onInputChange, onSubmit, isLoading = false }: LoginFormIndividualProps) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          id="username"
          className="form-input"
          placeholder="Enter your username"
          value={formData.username}
          onChange={(e) => onInputChange('username', e.target.value)}
          required
          autoComplete="username"
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label htmlFor="individualPassword" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="individualPassword"
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

