import { useEffect, useState } from "react";
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

const STORAGE_KEY = 'stayease.user';
const CITIES_KEY = 'stayease.cities';

const loadUserFromStorage = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.role && parsed.token) {
      return parsed as UserSession;
    }
    return null;
  } catch {
    return null;
  }
};

const loadCitiesFromStorage = (): string[] => {
  try {
    const raw = localStorage.getItem(CITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function App() {
  // Lazy initializers re-hydrate state from localStorage on every page load
  const [user, setUser] = useState<UserSession | null>(() => loadUserFromStorage());
  const [showRegister, setShowRegister] = useState(false);
  const [cities, setCities] = useState<string[]>(() => loadCitiesFromStorage());

  // Refresh cities silently when we have a restored session but no cached cities
  useEffect(() => {
    if (user && cities.length === 0) {
      (async () => {
        try {
          const resp = await getCities(user.token);
          const list = resp.data || [];
          setCities(list);
          localStorage.setItem(CITIES_KEY, JSON.stringify(list));
        } catch (err) {
          console.error('Failed to refresh cities on reload', err);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (session: UserSession) => {
    setUser(session);
    setShowRegister(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    try {
      const resp = await getCities(session.token);
      const list = resp.data || [];
      setCities(list);
      localStorage.setItem(CITIES_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to fetch cities after login', err);
      setCities([]);
      localStorage.removeItem(CITIES_KEY);
    }
  };

  const handleLogout = async () => {
    if (user?.token) {
      try {
        await apiLogout(user.token);
      } catch (err) {
        console.warn('Logout API failed:', err);
      }
    }
    setUser(null);
    setCities([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CITIES_KEY);
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
