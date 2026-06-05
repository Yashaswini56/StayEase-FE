import { FormEvent, useState } from 'react'
import { register } from '../api'
import {
  Box,
  TextField,
  Button,
  Card,
  Typography,
  Alert,
  Stack,
} from '@mui/material'

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
      await register({ name, email, password })

      setFeedback('Registration successful. Returning to login page...')
      window.setTimeout(() => {
        onBack()
      }, 700)
    } catch (error) {
      let message = 'Unable to register. Please try again.'
      if (error && typeof error === 'object' && 'response' in error) {
        // @ts-ignore
        message = error.response?.data?.message || message
      } else if (error instanceof Error) {
        message = error.message
      }
      setFeedback(`Registration failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          padding: 2.5,
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.18)',
          animation: 'fadeIn 0.45s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 1, color: '#342e74', fontWeight: 700 }}>
          Create a new StayEase account
        </Typography>
        <Typography sx={{ marginBottom: 2, color: '#5e5f72', lineHeight: 1.6 }}>
          Register once, then return to login to start booking rooms.
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              size="medium"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              size="medium"
            />

            <Stack direction="row" spacing={1.5} sx={{ marginTop: 2 }}>
              <Button
                fullWidth
                type="submit"
                disabled={loading}
                variant="contained"
                sx={{
                  padding: '0.95rem 1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
              <Button
                fullWidth
                type="button"
                onClick={onBack}
                disabled={loading}
                variant="outlined"
                sx={{
                  padding: '0.95rem 1rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                  },
                }}
              >
                Back to login
              </Button>
            </Stack>
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
      </Card>
    </Box>
  )
}

export default RegisterPage
