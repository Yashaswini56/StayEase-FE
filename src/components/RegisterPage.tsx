import { FormEvent, useState } from 'react'
import api from '../api'
import '../styles/RegisterPage.css'

type RegisterPageProps = {
  onBack: () => void
}

const RegisterPage = ({ onBack }: RegisterPageProps) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validate = () => {
    if (!name.trim()) {
      setFeedback('Please enter your full name.')
      return false
    }

    if (!email.trim() || !emailRegex.test(email)) {
      setFeedback('Please enter a valid email address.')
      return false
    }

    if (!password.trim() || password.length < 6) {
      setFeedback('Password must be at least 6 characters long.')
      return false
    }

    if (password !== confirmPassword) {
      setFeedback('The passwords do not match.')
      return false
    }

    setFeedback('')
    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setFeedback('Creating your account...')

    try {
      await api.post('/register', {
        name,
        email,
        password,
      })

      setFeedback('Registration successful. Returning to login page...')
      window.setTimeout(() => {
        onBack()
      }, 700)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to register. Please try again.'
      setFeedback(`Registration failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="register-container">
      <div className="register-card">
        <h2>Create a new StayEase account</h2>
        <p>Register once, then return to login to start booking rooms.</p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading}
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            disabled={loading}
          >
            Back to login
          </button>
        </form>

        {feedback && (
          <div className={`message ${feedback.startsWith('Registration successful') ? 'success-message' : 'error-message'}`}>
            {feedback}
          </div>
        )}
      </div>
    </section>
  )
}

export default RegisterPage;
