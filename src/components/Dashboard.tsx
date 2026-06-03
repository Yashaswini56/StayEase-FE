import React from 'react'
import '../styles/Dashboard.css'

type DashboardProps = {
  email: string
  role: 'User' | 'Admin' | 'Manager'
}

const Dashboard = ({ email, role }: DashboardProps) => {
  const userName = email.split('@')[0]

  return (
    <main className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-badge">Hotel Management Dashboard</p>
          <h2>Good to see you, {userName}.</h2>
          <p className="dashboard-subtitle">
            You are signed in as <strong>{role}</strong>. Manage rooms, reservations, and guest experiences from one place.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <p className="card-label">Upcoming Reservations</p>
          <h3>28</h3>
          <p>Confirmed bookings arriving this week.</p>
        </article>

        <article className="dashboard-card">
          <p className="card-label">Available Rooms</p>
          <h3>46</h3>
          <p>Rooms ready for walk-ins and group bookings.</p>
        </article>

        <article className="dashboard-card">
          <p className="card-label">Revenue</p>
          <h3>$12,540</h3>
          <p>Projected earnings for the next 7 days.</p>
        </article>
      </section>

      <section className="dashboard-actions">
        <div className="action-card">
          <h4>Manage Rooms</h4>
          <p>Update room availability, pricing, and amenities quickly.</p>
        </div>
        <div className="action-card">
          <h4>Reservations</h4>
          <p>Review bookings, confirmations, and guest check-in details.</p>
        </div>
        <div className="action-card">
          <h4>Guest Experience</h4>
          <p>Keep track of guest requests, service notes, and feedback.</p>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
