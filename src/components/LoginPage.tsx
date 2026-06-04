import { FormEvent, useState } from 'react'
import api from '../api'
import '../styles/LoginPage.css'

type UserSession = {
  email: string
  role: 'User' | 'Admin' | 'Manager'
  token: string
}

type FormErrors = {
  email?: string
  password?: string
}

type LoginPageProps = {
  onLogin: (session: UserSession) => void
  onCreateAccount: () => void
}

type LoginResponse = {
  token: string
  email: string
  role: 'User' | 'Admin' | 'Manager'
}

const LoginPage = ({ onLogin, onCreateAccount }: LoginPageProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validate = () => {
    const nextErrors: FormErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailRegex.test(email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      setFeedback('')
      return
    }

    setErrors({})
    setLoading(true)
    setFeedback('Signing in...')

    try {
      const response = await api.post<LoginResponse>('/login', {
        email,
        password,
      })

      const data = response.data
      const session = {
        email: data.email || email,
        role: data.role || 'User',
        token: data.token,
      }

      if (!session.token) {
        throw new Error('Invalid login response: missing token')
      }

      setFeedback('Login successful. Redirecting to dashboard...')
      onLogin(session)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to sign in. Please try again.'
      setFeedback(`Login failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">🏨</div>
          <h1>Welcome to StayEase</h1>
          <p>Secure hotel management access with login and role-aware dashboard.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {feedback && <p className="success-message">{feedback}</p>}

        <p className="register-link">
          New to StayEase?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onCreateAccount()
            }}
          >
            Create an account
          </a>
          .
        </p>
      </div>
    </section>
  )
}

export default LoginPage
