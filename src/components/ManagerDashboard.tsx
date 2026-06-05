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
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomStatus,
  getManagerIdByEmail,
  getHotelsByManager,
  getAllRoomsByHotel,
  Room,
  RoomReq,
  ManagerHotel,
} from '../api'

type ManagerDashboardProps = {
  email: string
  token: string
}

const emptyRoomForm: RoomReq = {
  roomNumber: '',
  roomType: 'SINGLE',
  pricePerNight: 0,
  maxOccupancy: 1,
  description: '',
  imageUrl: '',
  active: true,
}

const ManagerDashboard = ({ email, token }: ManagerDashboardProps) => {
  const [managerId, setManagerId] = useState<number | null>(null)
  const [hotels, setHotels] = useState<ManagerHotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<ManagerHotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])

  const [loading, setLoading] = useState(false)
  const [bootError, setBootError] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState<RoomReq>(emptyRoomForm)

  // 1) Resolve manager ID by email, then 2) load hotels
  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true)
      setBootError('')
      try {
        const idRes = await getManagerIdByEmail(email, token)
        const raw: any = idRes.data
        const resolvedId =
          typeof raw === 'number'
            ? raw
            : raw?.id ?? raw?.userId ?? raw?.managerId ?? null
        if (!resolvedId) {
          throw new Error('Manager ID not found for this account')
        }
        setManagerId(resolvedId)

        const hotelsRes = await getHotelsByManager(resolvedId)
        setHotels(hotelsRes.data || [])
      } catch (err: any) {
        setBootError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load manager profile'
        )
        console.error('Manager bootstrap error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (email && token) bootstrap()
  }, [email, token])

  // Auto-clear flash messages
  useEffect(() => {
    if (!message && !error) return
    const t = setTimeout(() => {
      setMessage('')
      setError('')
    }, 5000)
    return () => clearTimeout(t)
  }, [message, error])

  const loadRoomsForHotel = async (hotel: ManagerHotel) => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await getAllRoomsByHotel(hotel.hotelId)
      setRooms(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rooms')
      console.error('Error loading rooms:', err)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHotel = (hotel: ManagerHotel) => {
    setSelectedHotel(hotel)
    loadRoomsForHotel(hotel)
  }

  const handleBackToHotels = () => {
    setSelectedHotel(null)
    setRooms([])
  }

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setRoomForm({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        maxOccupancy: room.maxOccupancy,
        description: room.description ?? '',
        imageUrl: room.imageUrl ?? '',
        active: room.active,
      })
    } else {
      setEditingRoom(null)
      setRoomForm(emptyRoomForm)
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRoom(null)
  }

  const handleSaveRoom = async () => {
    if (!selectedHotel) {
      setError('No hotel selected')
      return
    }
    if (!roomForm.roomNumber || !roomForm.pricePerNight || !roomForm.maxOccupancy) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (editingRoom) {
        const response = await updateRoom(editingRoom.id, roomForm, token)
        setRooms(rooms.map((r) => (r.id === editingRoom.id ? response.data : r)))
        setMessage('Room updated successfully!')
      } else {
        const response = await createRoom(selectedHotel.hotelId, roomForm, token)
        setRooms([...rooms, response.data])
        setMessage('Room created successfully!')
      }
      handleCloseDialog()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save room')
      console.error('Error saving room:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await deleteRoom(roomId, token)
      setRooms(rooms.filter((r) => r.id !== roomId))
      setMessage('Room deleted successfully!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete room')
      console.error('Error deleting room:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (roomId: number) => {
    const current = rooms.find((r) => r.id === roomId)
    if (!current) return

    const newActive = !current.active

    // Optimistic UI update — flip the `active` field in the table immediately
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, active: newActive } : r))
    )
    setError('')
    setMessage('')

    try {
      const response = await toggleRoomStatus(roomId, token)
      const data: any = response?.data

      // If backend returned a room object, trust its `active` value
      if (data && typeof data === 'object' && typeof data.active === 'boolean') {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId ? { ...r, ...data, active: data.active } : r
          )
        )
        setMessage(
          `Room ${data.active ? 'activated' : 'deactivated'} successfully!`
        )
      } else {
        // Backend returned no body / unexpected shape — keep optimistic flip
        setMessage(
          `Room ${newActive ? 'activated' : 'deactivated'} successfully!`
        )
      }

      // Silent reconciliation with server (no spinner) so we always reflect truth
      if (selectedHotel) {
        try {
          const fresh = await getAllRoomsByHotel(selectedHotel.hotelId)
          if (Array.isArray(fresh.data)) setRooms(fresh.data)
        } catch {
          /* ignore — keep optimistic state */
        }
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, active: current.active } : r))
      )
      setError(err.response?.data?.message || 'Failed to toggle room status')
      console.error('Error toggling room status:', err)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          Manager Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Logged in as: <strong>{email}</strong>
          {managerId !== null && (
            <>
              {' '}· Manager ID: <strong>{managerId}</strong>
            </>
          )}
        </Typography>
      </Box>

      {bootError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {bootError}
        </Alert>
      )}
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

      {/* HOTEL LIST VIEW */}
      {!selectedHotel && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🏨 My Hotels
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && hotels.length === 0 && !bootError ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No hotels assigned to you yet.
              </Typography>
            </Card>
          ) : (
            !loading && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Hotel ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Hotel Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Rooms
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hotels.map((h) => (
                      <TableRow key={h.hotelId} hover>
                        <TableCell>{h.hotelId}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{h.hotelName}</TableCell>
                        <TableCell>
                          <Chip label={`📍 ${h.city}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<MeetingRoomIcon />}
                            onClick={() => handleSelectHotel(h)}
                            sx={{
                              background:
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontWeight: 'bold',
                            }}
                          >
                            Get Rooms
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </>
      )}

      {/* ROOMS VIEW FOR SELECTED HOTEL */}
      {selectedHotel && (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={handleBackToHotels} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  🛏️ Rooms · {selectedHotel.hotelName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hotel ID #{selectedHotel.hotelId} · {selectedHotel.city}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => loadRoomsForHotel(selectedHotel)}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Add New Room
              </Button>
            </Box>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && rooms.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No rooms in this hotel yet. Create one to get started.
              </Typography>
            </Card>
          ) : (
            !loading && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Room Number</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Price/Night
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Max Occupancy
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        Active
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rooms.map((room) => (
                      <TableRow key={room.id} hover>
                        <TableCell>#{room.roomNumber}</TableCell>
                        <TableCell>
                          <Chip label={room.roomType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          ₹{Number(room.pricePerNight).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">{room.maxOccupancy}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={room.active}
                            onChange={() => handleToggleStatus(room.id)}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog(room)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteRoom(room.id)}
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
        </>
      )}

      {/* Room Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRoom
            ? `Edit Room #${editingRoom.roomNumber}`
            : `Create New Room${selectedHotel ? ` · ${selectedHotel.hotelName}` : ''}`}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Room Number"
            value={roomForm.roomNumber}
            onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Room Type"
            value={roomForm.roomType}
            onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
            margin="normal"
            select
            SelectProps={{ native: true }}
            required
          >
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="SUITE">Suite</option>
            <option value="DELUXE">Deluxe</option>
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Price Per Night"
            value={roomForm.pricePerNight}
            onChange={(e) =>
              setRoomForm({ ...roomForm, pricePerNight: parseFloat(e.target.value) || 0 })
            }
            margin="normal"
            inputProps={{ step: '0.01', min: '0' }}
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Occupancy"
            value={roomForm.maxOccupancy}
            onChange={(e) =>
              setRoomForm({ ...roomForm, maxOccupancy: parseInt(e.target.value) || 1 })
            }
            margin="normal"
            inputProps={{ min: '1' }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={roomForm.description}
            onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={roomForm.imageUrl}
            onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={roomForm.active}
                onChange={(e) => setRoomForm({ ...roomForm, active: e.target.checked })}
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveRoom} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManagerDashboard
