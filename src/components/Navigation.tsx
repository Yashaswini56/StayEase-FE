import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

type NavigationProps = {
  userEmail?: string
  onLogout: () => void
}

function Navigation({ userEmail, onLogout }: NavigationProps) {
  return (
    <AppBar position="static" sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          StayEase
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userEmail && (
            <>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.95rem' }}>
                {userEmail}
              </Typography>
              <Button
                color="inherit"
                onClick={onLogout}
                endIcon={<LogoutIcon />}
                sx={{
                  textTransform: 'capitalize',
                  background: 'rgba(255, 255, 255, 0.14)',
                  px: 2,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
