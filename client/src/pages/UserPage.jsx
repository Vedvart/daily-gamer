import { useState } from 'react';
import useGameResults from '../hooks/useGameResults';
import ProfileHeader from '../components/ProfileHeader';
import TodayResults from '../components/TodayResults';
import {
  WordleHistogram,
  ConnectionsHistogram,
  MiniHistogram,
  BandleHistogram,
  CatfishingHistogram,
  TimeguessrHistogram,
} from '../components/GameHistogram';
import AddResultModal from '../components/AddResultModal';
import './UserPage.css';

function UserPage() {
  const {
    todayResults,
    addResult,
    removeResult,
    getAllHistograms,
    getGamesWithResults,
    clearAll,
  } = useGameResults();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddResult = () => {
    setIsModalOpen(true);
  };

  const handleResultParsed = (result) => {
    addResult(result);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stored results? This cannot be undone.')) {
      clearAll();
    }
  };

  const histograms = getAllHistograms();
  const gamesWithResults = getGamesWithResults();
  const hasAnyHistogramData = gamesWithResults.length > 0;

  return (
    <main className="user-page">
      <div className="user-page__container">
        <ProfileHeader
          username="Player"
          isOwner={true}
          onAddResult={handleAddResult}
        />

        <div className="user-page__content">
          {/* Today's Results - Full Width */}
          <section>
            <TodayResults
              results={todayResults}
              onRemoveResult={removeResult}
            />
          </section>

          {/* Average Results - Full Width Below */}
          <section>
            <h2 className="user-page__section-title">Average Results</h2>
            {hasAnyHistogramData ? (
              <div className="user-page__histograms">
                {gamesWithResults.includes('wordle') && (
                  <WordleHistogram data={histograms.wordle} />
                )}
                {gamesWithResults.includes('connections') && (
                  <ConnectionsHistogram data={histograms.connections} />
                )}
                {gamesWithResults.includes('mini') && (
                  <MiniHistogram data={histograms.mini} />
                )}
                {gamesWithResults.includes('bandle') && (
                  <BandleHistogram data={histograms.bandle} />
                )}
                {gamesWithResults.includes('catfishing') && (
                  <CatfishingHistogram data={histograms.catfishing} />
                )}
                {gamesWithResults.includes('timeguessr') && (
                  <TimeguessrHistogram data={histograms.timeguessr} />
                )}
              </div>
            ) : (
              <div className="user-page__empty-histograms">
                <p>No historical data yet.</p>
                <p className="user-page__empty-hint">
                  Add results to see your statistics over time.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Debug section */}
        <div className="user-page__debug">
          <button className="user-page__debug-button" onClick={handleClearAll}>
            Clear All Data (Debug)
          </button>
        </div>
      </div>

      <AddResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResultParsed={handleResultParsed}
      />
    </main>
  );
}

export default UserPage;
