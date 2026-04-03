import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
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
    </header>
  );
}

export default Header;
