import { useState } from 'react';
import useGameResults from '../hooks/useGameResults';
import ProfileHeader from '../components/ProfileHeader';
import TodayResults from '../components/TodayResults';
import WordleHistogram from '../components/WordleHistogram';
import AddResultModal from '../components/AddResultModal';
import './UserPage.css';

function UserPage() {
  const { todayResults, addResult, removeResult } = useGameResults();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddResult = () => {
    setIsModalOpen(true);
  };

  const handleResultParsed = (result) => {
    addResult(result);
  };

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
            <div className="user-page__histograms">
              <WordleHistogram />
              {/* More histogram cards will be added here for other games */}
            </div>
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
