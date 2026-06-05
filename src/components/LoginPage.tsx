import { FormEvent, useState } from 'react'
import { login } from '../api'
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'

type UserSession = {
  email: string
  role: string
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
  role: string
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
      const response = await login({ email, password })
      const data = response.data as LoginResponse
      const session = {
        email: data.email || email,
        role: data.role || 'GUEST',
        token: data.token,
      }

      if (!session.token) {
        throw new Error('Invalid login response: missing token')
      }

      setFeedback('Login successful. Redirecting to dashboard...')
      onLogin(session)
    } catch (error) {
      let message = 'Unable to sign in. Please try again.'
      if (error && typeof error === 'object' && 'response' in error) {
        // @ts-ignore
        message = error.response?.data?.message || message
      } else if (error instanceof Error) {
        message = error.message
      }
      setFeedback(`Login failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 70px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 380,
          padding: 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          animation: 'slideUp 0.5s ease',
          '@keyframes slideUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
          <Typography sx={{ fontSize: '2.5rem', marginBottom: 0.5 }}>
            🏨
          </Typography>
          <Typography
            variant="h4"
            sx={{ color: '#667eea', marginBottom: 0.5, fontWeight: 700 }}
          >
            Welcome to StayEase
          </Typography>
          <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
            Secure hotel management access with login and role-aware dashboard.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              fullWidth
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              size="medium"
            />

            <TextField
              fullWidth
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
              size="medium"
            />

            <Button
              fullWidth
              type="submit"
              disabled={loading}
              sx={{
                padding: '0.85rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: 1,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Stack>
        </form>

        {feedback && (
          <Alert
            severity={feedback.includes('failed') ? 'error' : 'success'}
            sx={{ marginTop: 2 }}
          >
            {feedback}
          </Alert>
        )}

        <Typography sx={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', marginTop: 2 }}>
          New to StayEase?{' '}
          <Link
            onClick={onCreateAccount}
            sx={{
              color: '#667eea',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { color: '#764ba2' },
            }}
          >
            Create an account
          </Link>
        </Typography>
      </Card>
    </Box>
  )
}

export default LoginPage
