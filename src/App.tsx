import { useState } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import RegisterPage from "./components/RegisterPage";
import { getCities, logout as apiLogout } from "./api";

type UserSession = {
  email: string;
  role: string;
  token: string;
};

function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  const handleLogin = async (session: UserSession) => {
    setUser(session);
    setShowRegister(false);

    try {
      const resp = await getCities(session.token)
      setCities(resp.data || [])
    } catch (err) {
      console.error('Failed to fetch cities after login', err)
      setCities([])
    }
  };

  const handleLogout = async () => {
    if (user?.token) {
      try {
        await apiLogout(user.token)
      } catch (err) {
        console.warn('Logout API failed:', err)
      }
    }
    setUser(null);
    setCities([])
  };

  return (
    <div className="app">
      <Navigation userEmail={user?.email} onLogout={handleLogout} />
      <main className="app-content">
        {user ? (
          <Dashboard
            email={user.email}
            role={user.role}
            token={user.token}
            cities={cities}
          />
        ) : showRegister ? (
          <RegisterPage onBack={() => setShowRegister(false)} />
        ) : (
          <LoginPage onLogin={handleLogin} onCreateAccount={() => setShowRegister(true)} />
        )}
      </main>
    </div>
  );
}

export default App;
