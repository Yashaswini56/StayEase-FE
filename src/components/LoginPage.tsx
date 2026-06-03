import React, { FormEvent, useState } from 'react'
import '../styles/LoginPage.css'

type Role = 'User' | 'Admin' | 'Manager'

type FormErrors = {
  email?: string
  password?: string
}

type LoginPageProps = {
  onLogin: (session: { email: string; role: Role }) => void
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('User')
  const [errors, setErrors] = useState<FormErrors>({})
  const [feedback, setFeedback] = useState('')

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      setFeedback('')
      return
    }

    setErrors({})
    setFeedback(`Welcome back, ${role}! Redirecting to your dashboard...`)
    onLogin({ email, role })
  }

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">🏨</div>
          <h1>Welcome to StayEase</h1>
          <p>Secure hotel management access with role selection and form validation.</p>
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
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <button className="login-button" type="submit">
            Sign In
          </button>
        </form>

        {feedback && <p className="success-message">{feedback}</p>}

        <p className="register-link">
          New to StayEase? <a href="#">Create an account</a>.
        </p>
      </div>
    </section>
  )
}

export default LoginPage
