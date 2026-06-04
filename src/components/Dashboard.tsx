import { useMemo, useState } from 'react'
import '../styles/Dashboard.css'

type Hotel = {
  id: string
  name: string
  city: string
  type: string
  price: number
  rooms: number
  rating: number
}

type DashboardProps = {
  email: string
  role: 'User' | 'Admin' | 'Manager'
  token: string
}

const hotelData: Hotel[] = [
  { id: 'h1', name: 'Vista Grande Hotel', city: 'San Francisco', type: 'Suite', price: 230, rooms: 12, rating: 4.8 },
  { id: 'h2', name: 'Oceanview Retreat', city: 'Miami', type: 'Deluxe', price: 185, rooms: 9, rating: 4.5 },
  { id: 'h3', name: 'Mountain Peak Inn', city: 'Denver', type: 'Standard', price: 145, rooms: 15, rating: 4.3 },
  { id: 'h4', name: 'City Center Lodge', city: 'New York', type: 'Suite', price: 290, rooms: 6, rating: 4.9 },
  { id: 'h5', name: 'Garden View Hotel', city: 'Austin', type: 'Deluxe', price: 175, rooms: 11, rating: 4.4 },
]

const Dashboard = ({ email, role, token }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roomType, setRoomType] = useState('All')
  const [bookingMessage, setBookingMessage] = useState('')
  const authStatus = token ? 'Secure session active' : 'No authentication token found'

  const filteredHotels = useMemo(() => {
    return hotelData.filter((hotel) => {
      const searchMatch = [hotel.name, hotel.city].some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const typeMatch = roomType === 'All' || hotel.type === roomType
      return searchMatch && typeMatch
    })
  }, [searchTerm, roomType])

  const handleBookRoom = (hotel: Hotel) => {
    setBookingMessage(`Booking requested for ${hotel.name}. Confirmation will be sent to ${email}.`)
    window.setTimeout(() => setBookingMessage(''), 4500)
  }

  const userName = email.split('@')[0]

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-badge">Hotel Management Dashboard</p>
          <h2>Welcome back, {userName}.</h2>
          <p className="dashboard-subtitle">
            You are signed in as <strong>{role}</strong>. Search and book rooms from the hotels below.
          </p>
          <p className="dashboard-status">{authStatus}</p>
        </div>
      </section>

      <section className="dashboard-controls">
        <div className="search-box">
          <span className="control-icon">🔍</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search hotels or cities"
          />
        </div>

        <div className="filter-box">
          <span className="control-icon">⚙️</span>
          <select value={roomType} onChange={(event) => setRoomType(event.target.value)}>
            <option value="All">All room types</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
          </select>
        </div>
      </section>

      {bookingMessage && <div className="booking-notice">{bookingMessage}</div>}

      <section className="hotel-grid">
        {filteredHotels.map((hotel) => (
          <article key={hotel.id} className="hotel-card">
            <div className="hotel-card-header">
              <h3>{hotel.name}</h3>
              <span>{hotel.rating.toFixed(1)} ★</span>
            </div>
            <p className="hotel-meta">{hotel.city} · {hotel.type}</p>
            <p className="hotel-details">{hotel.rooms} rooms available · ${hotel.price} / night</p>
            <button className="book-button" type="button" onClick={() => handleBookRoom(hotel)}>
              Book room
            </button>
          </article>
        ))}
        {filteredHotels.length === 0 && (
          <div className="no-results">No hotels match your search or filter.</div>
        )}
      </section>
    </main>
  )
}

export default Dashboard
