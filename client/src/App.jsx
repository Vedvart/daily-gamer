import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-grid">
            <span className="logo-tile green"></span>
            <span className="logo-tile yellow"></span>
            <span className="logo-tile blue"></span>
            <span className="logo-tile purple"></span>
          </div>
          <h1>Daily Gamer</h1>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <h2>Your Daily Games, One Place</h2>
          <p className="tagline">
            Track your Wordle, Connections, Mini, and more. Paste your results, see your stats.
          </p>
        </section>

        <section className="games-preview">
          <h3>Supported Games</h3>
          <div className="game-grid">
            <div className="game-card">
              <span className="game-emoji">W</span>
              <span className="game-name">Wordle</span>
            </div>
            <div className="game-card">
              <span className="game-emoji">C</span>
              <span className="game-name">Connections</span>
            </div>
            <div className="game-card">
              <span className="game-emoji">M</span>
              <span className="game-name">Mini</span>
            </div>
            <div className="game-card">
              <span className="game-emoji">B</span>
              <span className="game-name">Bandle</span>
            </div>
            <div className="game-card">
              <span className="game-emoji">F</span>
              <span className="game-name">Catfishing</span>
            </div>
            <div className="game-card">
              <span className="game-emoji">T</span>
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

      <footer className="footer">
        <p>Daily Gamer - Coming Soon</p>
      </footer>
    </div>
  );
}

export default App;
