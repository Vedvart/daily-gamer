import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <Link to="/" className="logo">
        <div className="logo-grid">
          <span className="logo-tile green"></span>
          <span className="logo-tile yellow"></span>
          <span className="logo-tile blue"></span>
          <span className="logo-tile purple"></span>
        </div>
        <h1>Daily Gamer</h1>
      </Link>
      <nav className="nav">
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/groups"
          className={`nav-link ${location.pathname.startsWith('/group') ? 'active' : ''}`}
        >
          Groups
        </Link>
      </nav>
    </header>
  );
}

export default Header;
