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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { createRoom, updateRoom, deleteRoom, toggleRoomStatus, Room, RoomReq } from '../api'

type ManagerDashboardProps = {
  email: string
  token: string
}

const ManagerDashboard = ({ email, token }: ManagerDashboardProps) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState<RoomReq>({
    roomNumber: '',
    roomType: 'SINGLE',
    pricePerNight: 0,
    maxOccupancy: 1,
    description: '',
    imageUrl: '',
    active: true,
  })

  const hotelId = 1 // This should be dynamically determined from the manager's hotel

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setRoomForm({
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        maxOccupancy: room.maxOccupancy,
        description: room.description,
        imageUrl: room.imageUrl,
        active: room.active,
      })
    } else {
      setEditingRoom(null)
      setRoomForm({
        roomNumber: '',
        roomType: 'SINGLE',
        pricePerNight: 0,
        maxOccupancy: 1,
        description: '',
        imageUrl: '',
        active: true,
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRoom(null)
  }

  const handleSaveRoom = async () => {
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
        const updatedRooms = rooms.map((r) => (r.id === editingRoom.id ? response.data : r))
        setRooms(updatedRooms)
        setMessage('Room updated successfully!')
      } else {
        const response = await createRoom(hotelId, roomForm, token)
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
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await toggleRoomStatus(roomId, token)
      const updatedRooms = rooms.map((r) => (r.id === roomId ? response.data : r))
      setRooms(updatedRooms)
      setMessage(`Room ${response.data.active ? 'activated' : 'deactivated'} successfully!`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle room status')
      console.error('Error toggling room status:', err)
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
          Manager Dashboard
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

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            mb: 3,
          }}
        >
          Add New Room
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && rooms.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">No rooms created yet. Create one to get started.</Typography>
        </Card>
      ) : (
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
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell align="right">₹{room.pricePerNight.toFixed(2)}</TableCell>
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
      )}

      {/* Room Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoom ? 'Edit Room' : 'Create New Room'}</DialogTitle>
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
            onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: parseFloat(e.target.value) })}
            margin="normal"
            inputProps={{ step: '0.01', min: '0' }}
            required
          />
          <TextField
            fullWidth
            type="number"
            label="Max Occupancy"
            value={roomForm.maxOccupancy}
            onChange={(e) => setRoomForm({ ...roomForm, maxOccupancy: parseInt(e.target.value) })}
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
