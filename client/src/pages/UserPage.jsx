import { useState } from 'react';
import useGameResults from '../hooks/useGameResults';
import ProfileHeader from '../components/ProfileHeader';
import TodayResults from '../components/TodayResults';
import WordleHistogram from '../components/WordleHistogram';
import AddResultModal from '../components/AddResultModal';
import './UserPage.css';

function UserPage() {
  const {
    todayResults,
    addResult,
    removeResult,
    getWordleHistogram,
    getGamesWithResults,
  } = useGameResults();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddResult = () => {
    setIsModalOpen(true);
  };

  const handleResultParsed = (result) => {
    addResult(result);
  };

  const wordleData = getWordleHistogram();
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
          <div className="user-page__left">
            <TodayResults
              results={todayResults}
              onRemoveResult={removeResult}
            />
          </div>

          <div className="user-page__right">
            <h2 className="user-page__section-title">Average Results</h2>
            {hasAnyHistogramData ? (
              <div className="user-page__histograms">
                <WordleHistogram data={wordleData} />
                {/* More histogram cards will be added here for other games */}
              </div>
            ) : (
              <div className="user-page__empty-histograms">
                <p>No historical data yet.</p>
                <p className="user-page__empty-hint">
                  Add results to see your statistics over time.
                </p>
              </div>
            )}
          </div>
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
