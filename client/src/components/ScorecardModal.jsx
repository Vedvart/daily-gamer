import { useState, useRef, useEffect } from 'react';
import './ScorecardModal.css';

const gameOrder = [
  'wordle', 'connections', 'strands', 'mini', 'latimesmini',
  'bandle', 'catfishing', 'timeguessr', 'travle', 'flagle',
  'kindahardgolf', 'enclosehorse', 'kickoffleague', 'scrandle',
  'oneuppuzzle', 'cluesbysam', 'minutecryptic', 'dailydozen',
  'moreorless', 'eruptle', 'thrice'
];
const gameNames = {
  wordle: 'Wordle',
  connections: 'Connections',
  strands: 'Strands',
  mini: 'NYT Mini',
  latimesmini: 'LA Times Mini',
  bandle: 'Bandle',
  catfishing: 'Catfishing',
  timeguessr: 'TimeGuessr',
  travle: 'Travle',
  flagle: 'Flagle',
  kindahardgolf: 'Kinda Hard Golf',
  enclosehorse: 'enclose.horse',
  kickoffleague: 'Kickoff League',
  scrandle: 'Scrandle',
  oneuppuzzle: 'One Up Puzzle',
  cluesbysam: 'Clues By Sam',
  minutecryptic: 'Minute Cryptic',
  dailydozen: 'Daily Dozen',
  moreorless: 'More Or Less',
  eruptle: 'Eruptle',
  thrice: 'Thrice',
};

// Games with finite tries that can "fail"
const finiteTriesGames = ['wordle', 'bandle', 'connections'];

function generateFullText(results) {
  const sortedResults = [...results].sort(
    (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
  );

  return sortedResults.map(r => r.rawText).join('\n\n');
}

function generateCompactText(results) {
  const sortedResults = [...results].sort(
    (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
  );

  const lines = sortedResults.map(r => {
    const gameName = gameNames[r.gameId] || r.gameName;
    switch (r.gameId) {
      case 'wordle':
        return `Wordle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'connections':
        if (r.isReversePerfect) return `Connections #${r.puzzleNumber}: Reverse Perfect`;
        if (r.isPurpleFirst) return `Connections #${r.puzzleNumber}: Purple First`;
        return `Connections #${r.puzzleNumber}: ${r.won ? `${r.scoreValue} mistakes` : 'Failed'}`;
      case 'strands':
        return `Strands #${r.puzzleNumber}: ${r.score}`;
      case 'mini':
        return `NYT Mini #${r.puzzleNumber}: ${r.score}`;
      case 'latimesmini':
        return `LA Times Mini #${r.puzzleNumber}: ${r.score}`;
      case 'bandle':
        return `Bandle #${r.puzzleNumber}: ${r.won ? r.score : 'X/6'}`;
      case 'catfishing':
        return `Catfishing #${r.puzzleNumber}: ${r.score}`;
      case 'timeguessr':
        return `TimeGuessr #${r.puzzleNumber}: ${r.score}`;
      case 'travle':
        return `Travle #${r.puzzleNumber}: ${r.score}`;
      case 'flagle':
        return `Flagle #${r.puzzleNumber}: ${r.score}`;
      case 'kindahardgolf':
        return `Kinda Hard Golf #${r.puzzleNumber}: ${r.score}`;
      case 'enclosehorse':
        return `enclose.horse Day ${r.puzzleNumber}: ${r.score}`;
      case 'kickoffleague':
        return `Kickoff League #${r.puzzleNumber}: ${r.score}`;
      case 'scrandle':
        return `Scrandle #${r.puzzleNumber}: ${r.score}`;
      case 'oneuppuzzle':
        return `One Up #${r.puzzleNumber}: ${r.score}`;
      case 'cluesbysam':
        return `Clues By Sam #${r.puzzleNumber}: ${r.score}`;
      case 'minutecryptic':
        return `Minute Cryptic #${r.puzzleNumber}: ${r.score}`;
      case 'dailydozen':
        return `Daily Dozen #${r.puzzleNumber}: ${r.score}`;
      case 'moreorless':
        return `More Or Less #${r.puzzleNumber}: ${r.score}`;
      case 'eruptle':
        return `Eruptle #${r.puzzleNumber}: ${r.score}`;
      case 'thrice':
        return `Thrice #${r.puzzleNumber}: ${r.score}`;
      default:
        return `${gameName} #${r.puzzleNumber}: ${r.score}`;
    }
  });

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `Daily Games - ${today}\n${lines.join('\n')}`;
}

function ScorecardModal({ isOpen, onClose, results }) {
  const [stage, setStage] = useState('options'); // 'options' or 'result'
  const [format, setFormat] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStage('options');
      setFormat(null);
      setGeneratedContent('');
      setCopyMessage('');
      setGeneratedImage(null);
    }
  }, [isOpen]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy');
    }
  };

  const copyImageToClipboard = async (canvas) => {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopyMessage('Image copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setCopyMessage('Failed to copy image - try right-click to save');
    }
  };

  const generateImage = async () => {
    setIsGeneratingImage(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const sortedResults = [...results].sort(
      (a, b) => gameOrder.indexOf(a.gameId) - gameOrder.indexOf(b.gameId)
    );

    // Canvas dimensions
    const padding = 32;
    const cardWidth = 280;
    const cardHeight = 120;
    const cardGap = 16;
    const cols = Math.min(sortedResults.length, 3);
    const rows = Math.ceil(sortedResults.length / 3);

    const width = padding * 2 + cols * cardWidth + (cols - 1) * cardGap;
    const height = padding * 2 + 60 + rows * cardHeight + (rows - 1) * cardGap;

    canvas.width = width;
    canvas.height = height;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Title
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Daily Games', width / 2, padding + 24);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText(today, width / 2, padding + 46);

    // Game colors
    const gameColors = {
      wordle: '#538d4e',
      connections: '#a855f7',
      strands: '#60a5fa',
      mini: '#3b82f6',
      latimesmini: '#f59e0b',
      bandle: '#eab308',
      catfishing: '#f97316',
      timeguessr: '#22c55e',
      travle: '#10b981',
      flagle: '#ef4444',
      kindahardgolf: '#84cc16',
      enclosehorse: '#8b5cf6',
      kickoffleague: '#06b6d4',
      scrandle: '#ec4899',
      oneuppuzzle: '#14b8a6',
      cluesbysam: '#f472b6',
      minutecryptic: '#a78bfa',
      dailydozen: '#fbbf24',
      moreorless: '#6366f1',
      eruptle: '#dc2626',
      thrice: '#0ea5e9',
    };

    // Draw cards with centering for incomplete rows
    sortedResults.forEach((result, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);

      // Calculate how many cards are in this row for centering
      const cardsInThisRow = Math.min(3, sortedResults.length - row * 3);
      const rowWidth = cardsInThisRow * cardWidth + (cardsInThisRow - 1) * cardGap;
      const rowOffset = (width - padding * 2 - rowWidth) / 2;

      const x = padding + rowOffset + col * (cardWidth + cardGap);
      const y = padding + 60 + row * (cardHeight + cardGap);

      // Card background
      ctx.fillStyle = 'rgba(37, 37, 64, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardWidth, cardHeight, 12);
      ctx.fill();

      // Accent bar
      ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
      ctx.fillRect(x, y, cardWidth, 4);

      // Game icon
      const iconSize = 32;
      const iconX = x + 16;
      const iconY = y + 20;

      ctx.fillStyle = gameColors[result.gameId] || '#6b7280';
      ctx.beginPath();
      ctx.roundRect(iconX, iconY, iconSize, iconSize, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(result.gameId[0].toUpperCase(), iconX + iconSize / 2, iconY + 22);

      // Game name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(gameNames[result.gameId] || result.gameName, iconX + iconSize + 12, iconY + 14);

      // Puzzle number
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${result.puzzleNumber}`, iconX + iconSize + 12, iconY + 28);

      // Score
      ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(result.score, x + cardWidth - 16, iconY + 22);

      // Status - only show "Failed" for games with finite tries
      let statusText;
      if (result.won) {
        statusText = 'Solved';
      } else if (finiteTriesGames.includes(result.gameId)) {
        statusText = 'Failed';
      } else {
        statusText = ''; // Don't show status for score-based games
      }
      if (statusText) {
        ctx.fillStyle = result.won ? '#22c55e' : '#ef4444';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        ctx.fillText(statusText, x + cardWidth - 16, y + cardHeight - 16);
      }
    });

    // Watermark
    ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('dailygamer.app', width / 2, height - 10);

    setGeneratedImage(canvas.toDataURL('image/png'));
    setIsGeneratingImage(false);

    // Auto-copy
    await copyImageToClipboard(canvas);
  };

  const handleGenerate = async (selectedFormat) => {
    setFormat(selectedFormat);

    if (selectedFormat === 'full') {
      const text = generateFullText(results);
      setGeneratedContent(text);
      setStage('result');
      await copyToClipboard(text);
    } else if (selectedFormat === 'compact') {
      const text = generateCompactText(results);
      setGeneratedContent(text);
      setStage('result');
      await copyToClipboard(text);
    } else if (selectedFormat === 'image') {
      setStage('result');
      await generateImage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scorecard-modal__overlay" onClick={onClose}>
      <div className="scorecard-modal" onClick={e => e.stopPropagation()}>
        <button className="scorecard-modal__close" onClick={onClose}>
          &times;
        </button>

        {stage === 'options' && (
          <>
            <h2 className="scorecard-modal__title">Generate Scorecard</h2>
            <p className="scorecard-modal__subtitle">
              Choose a format for your daily results
            </p>

            {results.length === 0 ? (
              <div className="scorecard-modal__empty">
                No results to share yet. Add some games first!
              </div>
            ) : (
              <div className="scorecard-modal__options">
                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('full')}
                >
                  <div className="scorecard-modal__option-icon">📝</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Full Text</h3>
                    <p>Complete share text for all games</p>
                  </div>
                </button>

                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('compact')}
                >
                  <div className="scorecard-modal__option-icon">📋</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Compact Text</h3>
                    <p>Abbreviated one-line summaries</p>
                  </div>
                </button>

                <button
                  className="scorecard-modal__option"
                  onClick={() => handleGenerate('image')}
                >
                  <div className="scorecard-modal__option-icon">🖼️</div>
                  <div className="scorecard-modal__option-content">
                    <h3>Image</h3>
                    <p>Visual scorecard to share</p>
                  </div>
                </button>
              </div>
            )}
          </>
        )}

        {stage === 'result' && (
          <>
            <button
              className="scorecard-modal__back"
              onClick={() => setStage('options')}
            >
              &larr; Back
            </button>

            <h2 className="scorecard-modal__title">
              {format === 'full' && 'Full Text Scorecard'}
              {format === 'compact' && 'Compact Scorecard'}
              {format === 'image' && 'Image Scorecard'}
            </h2>

            {copyMessage && (
              <div className="scorecard-modal__copy-message">{copyMessage}</div>
            )}

            {(format === 'full' || format === 'compact') && (
              <div className="scorecard-modal__text-result">
                <pre className="scorecard-modal__text">{generatedContent}</pre>
                <button
                  className="scorecard-modal__copy-btn"
                  onClick={() => copyToClipboard(generatedContent)}
                >
                  Copy Text
                </button>
              </div>
            )}

            {format === 'image' && (
              <div className="scorecard-modal__image-result">
                {isGeneratingImage ? (
                  <div className="scorecard-modal__loading">Generating image...</div>
                ) : (
                  <>
                    <img
                      src={generatedImage}
                      alt="Scorecard"
                      className="scorecard-modal__image"
                    />
                    <button
                      className="scorecard-modal__copy-btn"
                      onClick={() => copyImageToClipboard(canvasRef.current)}
                    >
                      Copy Image
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default ScorecardModal;
