
import '../styles/Navigation.css'

type NavigationProps = {
  userEmail?: string
  onLogout: () => void
}

function Navigation({ userEmail, onLogout }: NavigationProps) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">StayEase</div>

        <nav aria-label="Main navigation">
          <ul className="navbar-menu">
            <li>
              <a href="#">Home</a>
            </li>
            {/* <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Support</a>
            </li> */}
          </ul>
        </nav>

        <div className="navbar-actions">
          {userEmail ? (
            <>
              <span className="navbar-user">{userEmail}</span>
              <button className="logout-button" onClick={onLogout} type="button">
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Navigation
