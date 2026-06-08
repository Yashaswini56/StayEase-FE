import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { createHotel, updateHotel, deleteHotel, registerAdmin, listAllHotels, getCities, getAllManagers, Hotel, HotelReq, Manager } from '../api'

type AdminDashboardProps = {
  email: string
  token: string
}

type TabPanelProps = {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

const AdminDashboard = ({ email, token }: AdminDashboardProps) => {
  const [tabValue, setTabValue] = useState(0)
  const [allHotels, setAllHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Filters for All Hotels
  const [filterName, setFilterName] = useState('')
  const [filterCity, setFilterCity] = useState('')

  // Cities (fetched from /api/cities)
  const [cities, setCities] = useState<string[]>([])

  // Managers (fetched from /api/users/managers)
  const [managers, setManagers] = useState<Manager[]>([])
  const [managersLoading, setManagersLoading] = useState(false)

  const loadManagers = async () => {
    setManagersLoading(true)
    try {
      const res = await getAllManagers(token)
      setManagers(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load managers')
    } finally {
      setManagersLoading(false)
    }
  }

  // Hotel Dialog States
  const [hotelDialogOpen, setHotelDialogOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [hotelForm, setHotelForm] = useState<HotelReq>({
    name: '',
    city: '',
    starRating: 3,
    description: '',
    coverImageUrl: '',
    managerId: 0,
  })

  // User Registration States
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MANAGER' as 'MANAGER' | 'ADMIN',
  })

  const loadAllHotels = async (name?: string, city?: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await listAllHotels(name || undefined, city || undefined)
      setAllHotels(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (newValue === 0) loadAllHotels(filterName, filterCity)
    if (newValue === 1) loadManagers()
  }

  const handleOpenHotelDialog = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel)
      setHotelForm({
        name: hotel.name,
        city: hotel.city,
        starRating: hotel.starRating,
        description: hotel.description,
        coverImageUrl: hotel.coverImageUrl,
        managerId: hotel.managerId,
      })
    } else {
      setEditingHotel(null)
      setHotelForm({ name: '', city: '', starRating: 3, description: '', coverImageUrl: '', managerId: 0 })
    }
    setHotelDialogOpen(true)
  }

  const handleCloseHotelDialog = () => {
    setHotelDialogOpen(false)
    setEditingHotel(null)
  }

  const handleSaveHotel = async () => {
    if (!hotelForm.name || !hotelForm.city || !hotelForm.managerId) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (editingHotel) {
        const response = await updateHotel(editingHotel.id, hotelForm, token)
        const hotelData = { ...hotelForm, ...response.data }
        setAllHotels(allHotels.map((h) => (h.id === editingHotel.id ? hotelData : h)))
        setMessage('Hotel updated successfully!')
      } else {
        const response = await createHotel(hotelForm, token)
        const hotelData = { ...hotelForm, ...response.data }
        setAllHotels([...allHotels, hotelData])
        setMessage('Hotel created successfully!')
      }
      handleCloseHotelDialog()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hotel')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHotel = async (hotelId: number) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await deleteHotel(hotelId, token)
      setAllHotels(allHotels.filter((h) => h.id !== hotelId))
      setMessage('Hotel deleted successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hotel')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRegisterDialog = () => {
    setRegisterForm({ name: '', email: '', password: '', role: 'MANAGER' })
    setRegisterDialogOpen(true)
  }

  const handleRegisterUser = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await registerAdmin(registerForm, token)
      const responseData =
        typeof response.data === 'string'
          ? response.data
          : `${registerForm.email} (${registerForm.role})`
      setMessage(`User registered successfully - ${responseData}`)
      setRegisterDialogOpen(false)
      // Refresh managers list if a manager was added
      if (registerForm.role === 'MANAGER') loadManagers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllHotels()
    ;(async () => {
      try {
        const res = await getCities(token)
        setCities(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Error loading cities:', err)
      }
    })()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 5000)
    return () => clearTimeout(timer)
  }, [message, error])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Logged in as: <strong>{email}</strong>
        </Typography>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Hotels Management" />
          <Tab label="Register Users" />
        </Tabs>
      </Paper>

      {/* Hotels Management Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenHotelDialog()}
            sx={{ background: GRADIENT }}
          >
            Add New Hotel
          </Button>
        </Box>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            Filter by Hotel Name or City:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              label="Hotel Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>City</InputLabel>
              <Select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} label="City">
                <MenuItem value="">
                  <em>All Cities</em>
                </MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => loadAllHotels(filterName, filterCity)}
              disabled={loading}
              sx={{ background: GRADIENT }}
            >
              {loading ? 'Filtering...' : 'Filter'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterName('')
                setFilterCity('')
                loadAllHotels()
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Card>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && allHotels.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">No hotels found.</Typography>
          </Card>
        ) : (
          !loading && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#667eea' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Hotel Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>City</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
                      Stars
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Manager ID</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allHotels.map((hotel) => (
                    <TableRow key={hotel.id} hover>
                      <TableCell>{hotel.name}</TableCell>
                      <TableCell>{hotel.city}</TableCell>
                      <TableCell align="center">
                        {hotel.stars || Math.max(0, parseInt(String(hotel.starRating)) || 0)}
                      </TableCell>
                      <TableCell>{hotel.managerId}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenHotelDialog(hotel)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteHotel(hotel.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </TabPanel>

      {/* User Registration Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            All Managers
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenRegisterDialog}
            sx={{ background: GRADIENT }}
          >
            Register New User
          </Button>
        </Box>

        {managersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : managers.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">No managers found.</Typography>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#667eea' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Manager ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {managers.map((m) => (
                  <TableRow key={m.managerId} hover>
                    <TableCell>{m.managerId}</TableCell>
                    <TableCell>{m.managerName}</TableCell>
                    <TableCell>{m.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Hotel Dialog */}
      <Dialog open={hotelDialogOpen} onClose={handleCloseHotelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Create New Hotel'}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Hotel Name"
            value={hotelForm.name}
            onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>City</InputLabel>
            <Select
              value={hotelForm.city}
              onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
              label="City"
            >
              {cities.length === 0 && (
                <MenuItem value="" disabled>
                  No cities available
                </MenuItem>
              )}
              {hotelForm.city && !cities.includes(hotelForm.city) && (
                <MenuItem value={hotelForm.city}>{hotelForm.city}</MenuItem>
              )}
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Star Rating"
            value={hotelForm.starRating}
            onChange={(e) => setHotelForm({ ...hotelForm, starRating: parseInt(e.target.value) })}
            margin="normal"
            inputProps={{ min: 1, max: 5 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={hotelForm.description}
            onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Cover Image URL"
            value={hotelForm.coverImageUrl}
            onChange={(e) => setHotelForm({ ...hotelForm, coverImageUrl: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Manager ID"
            value={hotelForm.managerId}
            onChange={(e) => setHotelForm({ ...hotelForm, managerId: parseInt(e.target.value) })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHotelDialog}>Cancel</Button>
          <Button onClick={handleSaveHotel} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register User Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New User</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Full Name"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Role</InputLabel>
            <Select
              value={registerForm.role}
              onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as 'MANAGER' | 'ADMIN' })}
              label="Role"
            >
              <MenuItem value="MANAGER">Manager</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRegisterUser} variant="contained" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AdminDashboard
