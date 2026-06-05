import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

type LoginReq = { email: string; password: string }
type RegisterReq = { name: string; email: string; password: string }
type RegisterAdminReq = { name: string; email: string; password: string; role: 'MANAGER' | 'ADMIN' }

export async function login(req: LoginReq) {
  return api.post('/api/auth/login', req)
}

export async function register(req: RegisterReq) {
  return api.post('/api/auth/register', req)
}

export async function registerAdmin(req: RegisterAdminReq, token: string) {
  return api.post('/api/auth/register-admin', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function logout(token?: string) {
  return api.post(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  )
}

export async function getCities(token?: string) {
  return api.get<string[]>('/api/cities', {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  })
}

// ADMIN - Hotel Operations
export type HotelReq = {
  name: string
  city: string
  starRating: number
  description: string
  coverImageUrl: string
  managerId: number
}

export type Hotel = HotelReq & {
  id: number
  stars?: number
}

export async function createHotel(req: HotelReq, token: string) {
  return api.post<Hotel>('/api/hotels', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateHotel(id: number, req: HotelReq, token: string) {
  return api.put<Hotel>(`/api/hotels/${id}`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function deleteHotel(id: number, token: string) {
  return api.delete(`/api/hotels/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function searchHotels(city?: string, minStars?: number, page: number = 0, size: number = 20) {
  return api.get<{ content: Hotel[]; totalElements: number }>('/api/hotels', {
    params: {
      ...(city && { city }),
      ...(minStars && { minStars }),
      page,
      size,
    },
  })
}

export async function listAllHotels(name?: string, city?: string) {
  return api.get<Hotel[]>('/api/hotels/all', {
    params: {
      ...(name && { name }),
      ...(city && { city }),
    },
  })
}

// MANAGER - Room Operations
export type RoomReq = {
  roomNumber: string
  roomType: string
  pricePerNight: number
  maxOccupancy: number
  description: string
  imageUrl: string
  active: boolean
}

export type Room = RoomReq & {
  id: number
  hotelId: number
}

export async function createRoom(hotelId: number, req: RoomReq, token: string) {
  return api.post<Room>(`/api/hotels/${hotelId}/rooms`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateRoom(roomId: number, req: RoomReq, token: string) {
  return api.put<Room>(`/api/rooms/${roomId}`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function deleteRoom(roomId: number, token: string) {
  return api.delete(`/api/rooms/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function toggleRoomStatus(roomId: number, token: string) {
  return api.patch<Room>(`/api/rooms/${roomId}/status`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getAvailableRooms(hotelId: number, checkIn: string, checkOut: string) {
  return api.get<Room[]>(`/api/hotels/${hotelId}/rooms`, {
    params: {
      checkIn,
      checkOut,
    },
  })
}

// GUEST - Booking Operations
export type BookingReq = {
  roomId: number
  checkInDate: string
  checkOutDate: string
}

export type Booking = {
  id: number
  roomId: number
  userId: number
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: string
  createdAt: string
}

export async function createBooking(req: BookingReq, token: string) {
  return api.post<Booking>('/api/bookings', req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getMyBookings(token: string) {
  return api.get<Booking[]>('/api/bookings/mine', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function cancelBooking(bookingId: number, token: string) {
  return api.put(`/api/bookings/${bookingId}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export default api
