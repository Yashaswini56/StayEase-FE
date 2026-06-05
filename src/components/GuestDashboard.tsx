import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Chip,
  CardContent,
  CardMedia,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import CancelIcon from '@mui/icons-material/Cancel'
import { searchHotels, getAvailableRooms, createBooking, getMyBookings, cancelBooking, Hotel, Room, Booking } from '../api'

type GuestDashboardProps = {
  email: string
  token: string
  cities: string[]
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
      id={`guest-tabpanel-${index}`}
      aria-labelledby={`guest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const GuestDashboard = ({ email, token, cities }: GuestDashboardProps) => {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Search Hotels
  const [searchCity, setSearchCity] = useState('')
  const [minStars, setMinStars] = useState(0)
  const [hotels, setHotels] = useState<Hotel[]>([])

  // Available Rooms
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])

  // Bookings
  const [myBookings, setMyBookings] = useState<Booking[]>([])

  // Booking Dialog
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (newValue === 1) {
      loadMyBookings()
    }
  }

  // Search Hotels - GET /api/hotels?city=Mumbai&minStars=3&page=0&size=20
  const handleSearchHotels = async () => {
    if (!searchCity) {
      setError('Please select a city')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')
    setAvailableRooms([])
    setSelectedHotel(null)

    try {
      const response = await searchHotels(searchCity, minStars > 0 ? minStars : undefined, 0, 20)
      const hotelsList = response.data.content || response.data || []
      setHotels(hotelsList)
      if (!hotelsList || hotelsList.length === 0) {
        setMessage('No hotels found for the selected criteria')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search hotels')
      console.error('Error searching hotels:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get Available Rooms - GET /api/hotels/{hotelId}/rooms?checkIn=2026-06-10&checkOut=2026-06-15
  const handleGetAvailableRooms = async (hotel: Hotel) => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates')
      return
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Check-out date must be after check-in date')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await getAvailableRooms(hotel.id, checkInDate, checkOutDate)
      const rooms = Array.isArray(response.data) ? response.data : []
      setAvailableRooms(rooms)
      setSelectedHotel(hotel)
      if (!rooms || rooms.length === 0) {
        setMessage('No available rooms for the selected dates')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch available rooms')
      console.error('Error fetching available rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load My Bookings
  const loadMyBookings = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await getMyBookings(token)
      setMyBookings(response.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings')
      console.error('Error loading bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Book Room - POST /api/bookings with body { roomId, checkInDate, checkOutDate }
  const handleOpenBookingDialog = (room: Room) => {
    setSelectedRoom(room)
    setBookingDialogOpen(true)
  }

  const handleCloseBookingDialog = () => {
    setBookingDialogOpen(false)
    setSelectedRoom(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) {
      setError('Missing booking details')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const bookingPayload = {
        roomId: selectedRoom.id,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      }
      const response = await createBooking(bookingPayload, token)
      setMessage(`Booking created successfully! Booking ID: ${response.data.id}`)
      handleCloseBookingDialog()
      setAvailableRooms(availableRooms.filter((r) => r.id !== selectedRoom.id))
      // Refresh bookings list
      setTimeout(() => {
        loadMyBookings()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking')
      console.error('Error creating booking:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cancel Booking - PUT /api/bookings/{bookingId}/cancel
  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await cancelBooking(bookingId, token)
      setMyBookings(myBookings.filter((b) => b.id !== bookingId))
      setMessage('Booking cancelled successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
      console.error('Error cancelling booking:', err)
    } finally {
      setLoading(false)
    }
  }

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
          Guest Dashboard
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
          aria-label="guest tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Search & Book Hotels" id="guest-tab-0" aria-controls="guest-tabpanel-0" />
          <Tab label="My Bookings" id="guest-tab-1" aria-controls="guest-tabpanel-1" />
        </Tabs>
      </Paper>

      {/* Search & Book Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Search Filters */}
          <Grid item xs={12}>
            <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                🔍 Search Hotels
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>City</InputLabel>
                    <Select
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      label="City"
                    >
                      <MenuItem value="">-- Select City --</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Minimum Stars</InputLabel>
                    <Select
                      value={minStars}
                      onChange={(e) => setMinStars(Number(e.target.value))}
                      label="Minimum Stars"
                    >
                      <MenuItem value={0}>All Ratings</MenuItem>
                      <MenuItem value={3}>⭐ 3+ Stars</MenuItem>
                      <MenuItem value={4}>⭐ 4+ Stars</MenuItem>
                      <MenuItem value={5}>⭐ 5 Stars</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SearchIcon />}
                    onClick={handleSearchHotels}
                    disabled={loading || !searchCity}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      height: '56px',
                      fontWeight: 'bold',
                    }}
                  >
                    {loading ? 'Searching...' : 'Search Hotels'}
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Hotels List */}
          {hotels.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                🏨 Available Hotels ({hotels.length})
              </Typography>
              <Grid container spacing={2}>
                {hotels.map((hotel) => (
                  <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(102, 126, 234, 0.4)',
                        },
                      }}
                    >
                      {hotel.coverImageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={hotel.coverImageUrl}
                          alt={hotel.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {hotel.name}
                        </Typography>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={hotel.starRating} readOnly size="small" />
                          <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                            {hotel.starRating}.0
                          </Typography>
                        </Box>
                        <Chip
                          label={`📍 ${hotel.city}`}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" sx={{ mb: 2, minHeight: '40px', color: '#666' }}>
                          {hotel.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                            Check-in & Check-out Dates:
                          </Typography>
                          <TextField
                            type="date"
                            size="small"
                            fullWidth
                            label="Check-in"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            type="date"
                            size="small"
                            fullWidth
                            label="Check-out"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleGetAvailableRooms(hotel)}
                          disabled={loading || !checkInDate || !checkOutDate}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold',
                          }}
                        >
                          View Available Rooms
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Available Rooms */}
          {selectedHotel && availableRooms.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 3, background: 'linear-gradient(135deg, #28a74515 0%, #20c99715 100%)' }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  🛏️ Available Rooms in {selectedHotel.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                  Check-in: <strong>{checkInDate}</strong> | Check-out: <strong>{checkOutDate}</strong>
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#667eea' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Room Number</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Price/Night
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Max Occupancy
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableRooms.map((room) => (
                        <TableRow key={room.id} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                          <TableCell sx={{ fontWeight: '500' }}>#{room.roomNumber}</TableCell>
                          <TableCell>
                            <Chip label={room.roomType} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                            ₹{room.pricePerNight.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">{room.maxOccupancy} {room.maxOccupancy > 1 ? 'guests' : 'guest'}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<BookmarkIcon />}
                              onClick={() => handleOpenBookingDialog(room)}
                              disabled={loading}
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 'bold',
                              }}
                            >
                              Book Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          )}

          {/* Empty State */}
          {!loading && hotels.length === 0 && searchCity && (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center', background: '#f9f9f9' }}>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  No hotels found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Try searching with different criteria or check back later.
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* My Bookings Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && myBookings.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center', background: '#f9f9f9' }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
              No bookings yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Search and book a hotel to get started.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {myBookings.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <Card
                  sx={{
                    p: 2.5,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        BOOKING ID
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                        #{booking.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        ROOM ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {booking.roomId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        CHECK-IN
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        CHECK-OUT
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: '500' }}>
                        {new Date(booking.checkOutDate).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold' }}>
                        TOTAL PRICE
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                        ₹{booking.totalPrice.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Chip
                          label={booking.status}
                          color={booking.status === 'CONFIRMED' ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={loading}
                            sx={{ textTransform: 'none', fontWeight: '500' }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={handleCloseBookingDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 'bold' }}>
          ✓ Confirm Your Booking
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRoom && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
                <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  HOTEL
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600' }}>
                  {selectedHotel?.name}
                </Typography>
              </Box>

              <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
                <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  ROOM DETAILS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600' }}>
                  Room #{selectedRoom.roomNumber} · {selectedRoom.roomType}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Max Occupancy: {selectedRoom.maxOccupancy} {selectedRoom.maxOccupancy > 1 ? 'guests' : 'guest'}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ p: 2, background: '#e8f5e9', borderRadius: 1, border: '1px solid #4caf50' }}>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                    📅 CHECK-IN
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600', color: '#1b5e20' }}>
                    {new Date(checkInDate).toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, background: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                  <Typography variant="caption" sx={{ color: '#c62828', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                    📅 CHECK-OUT
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600', color: '#b71c1c' }}>
                    {new Date(checkOutDate).toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, background: '#f5f5f5', borderRadius: 1, border: '1px solid #ddd' }}>
                <Typography variant="caption" sx={{ color: '#999', fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  PRICE BREAKDOWN
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Price per night:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>
                    ₹{selectedRoom.pricePerNight.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Number of nights:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>
                    {Math.ceil(
                      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '2px solid #ddd' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total Amount:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                    ₹
                    {(
                      selectedRoom.pricePerNight *
                      Math.ceil(
                        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
                      )
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseBookingDialog} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBooking} 
            variant="contained" 
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              fontWeight: 'bold',
              px: 3,
            }}
          >
            {loading ? 'Processing...' : 'Confirm & Book'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default GuestDashboard
