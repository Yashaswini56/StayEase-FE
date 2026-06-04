import { useState } from "react";
import "./App.css";
import Navigation from "./components/Navigation";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import RegisterPage from "./components/RegisterPage";

type UserSession = {
  email: string;
  role: "User" | "Admin" | "Manager";
  token: string;
};

function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (session: UserSession) => {
    setUser(session);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Navigation userEmail={user?.email} onLogout={handleLogout} />
      <main className="app-content">
        {user ? (
          <Dashboard email={user.email} role={user.role} token={user.token} />
        ) : showRegister ? (
          <RegisterPage onBack={() => setShowRegister(false)} />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onCreateAccount={() => setShowRegister(true)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
