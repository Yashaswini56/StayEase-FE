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
import { createHotel, updateHotel, deleteHotel, registerAdmin, listAllHotels, Hotel, HotelReq } from '../api'

type AdminDashboardProps = {
  email: string
  token: string
}

type TabPanelProps = {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const AdminDashboard = ({ email, token }: AdminDashboardProps) => {
  const [tabValue, setTabValue] = useState(0)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [allHotels, setAllHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Filters for All Hotels
  const [filterName, setFilterName] = useState('')
  const [filterCity, setFilterCity] = useState('')

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (newValue === 0) {
      loadAllHotels()
    }
  }

  // Load all hotels
  const loadAllHotels = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await listAllHotels(filterName || undefined, filterCity || undefined)
      setAllHotels(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hotels')
      console.error('Error loading hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  // Hotel operations
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
      setHotelForm({
        name: '',
        city: '',
        starRating: 3,
        description: '',
        coverImageUrl: '',
        managerId: 0,
      })
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
        // Ensure response includes all form data, including managerId
        const hotelData = { ...hotelForm, ...response.data }
        const updatedHotels = hotels.map((h) => (h.id === editingHotel.id ? hotelData : h))
        setHotels(updatedHotels)
        const updatedAllHotels = allHotels.map((h) => (h.id === editingHotel.id ? hotelData : h))
        setAllHotels(updatedAllHotels)
        setMessage('Hotel updated successfully!')
      } else {
        const response = await createHotel(hotelForm, token)
        // Ensure response includes all form data, including managerId
        const hotelData = { ...hotelForm, ...response.data }
        setHotels([...hotels, hotelData])
        setAllHotels([...allHotels, hotelData])
        setMessage('Hotel created successfully!')
      }
      handleCloseHotelDialog()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hotel')
      console.error('Error saving hotel:', err)
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
      setHotels(hotels.filter((h) => h.id !== hotelId))
      setAllHotels(allHotels.filter((h) => h.id !== hotelId))
      setMessage('Hotel deleted successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hotel')
      console.error('Error deleting hotel:', err)
    } finally {
      setLoading(false)
    }
  }

  // User Registration
  const handleOpenRegisterDialog = () => {
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      role: 'MANAGER',
    })
    setRegisterDialogOpen(true)
  }

  const handleCloseRegisterDialog = () => {
    setRegisterDialogOpen(false)
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
      await registerAdmin(registerForm, token)
      setMessage(`${registerForm.role} registered successfully!`)
      handleCloseRegisterDialog()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register user')
      console.error('Error registering user:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load all hotels when component mounts
    loadAllHotels()
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
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
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
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Hotels Management" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Register Users" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
        </Tabs>
      </Paper>

      {/* Hotels Management Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenHotelDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 3,
            }}
          >
            Add New Hotel
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && hotels.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">No hotels created yet. Create one to get started.</Typography>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hotel Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Stars
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Manager ID</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id} hover>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>{hotel.city}</TableCell>
                    <TableCell align="center">{hotel.starRating}</TableCell>
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
        )}

        {/* All Hotels Section */}
        <Box sx={{ mt: 4, pt: 4, borderTop: '2px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            🏨 All Hotels
          </Typography>
          <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 2, fontWeight: '500' }}>
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
              <TextField
                label="City"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
              <Button
                variant="contained"
                onClick={loadAllHotels}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Filtering...' : 'Filter'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilterName('')
                  setFilterCity('')
                }}
                sx={{ fontWeight: 'bold' }}
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
              <Typography color="textSecondary">No hotels found. Try adjusting your filters.</Typography>
            </Card>
          ) : (
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
                    <TableRow key={hotel.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell sx={{ fontWeight: '600' }}>{hotel.name}</TableCell>
                      <TableCell>{hotel.city}</TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 'bold', color: '#ffc107' }}>
                          {hotel.stars || Math.max(0, parseInt(String(hotel.starRating)) || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: '500' }}>{hotel.managerId}</TableCell>
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
          )}
        </Box>
      </TabPanel>

      {/* User Registration Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenRegisterDialog}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 3,
            }}
          >
            Register New User
          </Button>
        </Box>

        <Card sx={{ p: 4 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Use this form to register new Manager or Admin users. They will receive login credentials via email.
          </Typography>
        </Card>
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
          <TextField
            fullWidth
            label="City"
            value={hotelForm.city}
            onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
            margin="normal"
            required
          />
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
      <Dialog open={registerDialogOpen} onClose={handleCloseRegisterDialog} maxWidth="sm" fullWidth>
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
          <Button onClick={handleCloseRegisterDialog}>Cancel</Button>
          <Button onClick={handleRegisterUser} variant="contained" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AdminDashboard
