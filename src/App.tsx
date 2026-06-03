import React, { useState } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'

type UserSession = {
  email: string
  role: 'User' | 'Admin' | 'Manager'
}

function App() {
  const [user, setUser] = useState<UserSession | null>(null)

  const handleLogin = (session: UserSession) => {
    setUser(session)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="app">
      <Navigation userEmail={user?.email} onLogout={handleLogout} />
      {user ? <Dashboard email={user.email} role={user.role} /> : <LoginPage onLogin={handleLogin} />}
    </div>
  )
}

export default App
