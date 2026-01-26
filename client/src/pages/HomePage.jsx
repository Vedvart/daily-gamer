import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <main className="home-main">
      <section className="hero">
        <h2>Your Daily Games, One Place</h2>
        <p className="tagline">
          Track your Wordle, Connections, Mini, and more. Paste your results, see your stats.
        </p>
        <Link to="/dashboard" className="cta-button">
          Get Started
        </Link>
      </section>

      <section className="games-preview">
        <h3>Supported Games</h3>
        <div className="game-grid">
          <div className="game-card">
            <span className="game-icon wordle">W</span>
            <span className="game-name">Wordle</span>
          </div>
          <div className="game-card">
            <span className="game-icon connections">C</span>
            <span className="game-name">Connections</span>
          </div>
          <div className="game-card">
            <span className="game-icon mini">M</span>
            <span className="game-name">Mini</span>
          </div>
          <div className="game-card">
            <span className="game-icon bandle">B</span>
            <span className="game-name">Bandle</span>
          </div>
          <div className="game-card">
            <span className="game-icon catfishing">F</span>
            <span className="game-name">Catfishing</span>
          </div>
          <div className="game-card">
            <span className="game-icon timeguessr">T</span>
            <span className="game-name">TimeGuessr</span>
          </div>
        </div>
      </section>

      <section className="status">
        <p>
          API Status:{' '}
          <span className={`status-indicator ${apiStatus === 'ok' ? 'online' : 'offline'}`}>
            {apiStatus === 'ok' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking...'}
          </span>
        </p>
      </section>
    </main>
  );
}

export default HomePage;
