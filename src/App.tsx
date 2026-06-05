import { useState } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Navigation from "./components/Navigation";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import GuestDashboard from "./components/GuestDashboard";
import RegisterPage from "./components/RegisterPage";
import { getCities, logout as apiLogout } from "./api";

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#eef2ff',
    },
  },
  typography: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
  },
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation userEmail={user?.email} onLogout={handleLogout} />
        <Box component="main" sx={{ flex: 1 }}>
          {user ? (
            <>
              {user.role === 'ADMIN' ? (
                <AdminDashboard email={user.email} token={user.token} />
              ) : user.role === 'MANAGER' ? (
                <ManagerDashboard email={user.email} token={user.token} />
              ) : (
                <GuestDashboard email={user.email} token={user.token} cities={cities} />
              )}
            </>
          ) : showRegister ? (
            <RegisterPage onBack={() => setShowRegister(false)} />
          ) : (
            <LoginPage onLogin={handleLogin} onCreateAccount={() => setShowRegister(true)} />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
