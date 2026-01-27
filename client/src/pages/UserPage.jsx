import { useState } from 'react';
import useGameResults from '../hooks/useGameResults';
import ProfileHeader from '../components/ProfileHeader';
import TodayResults from '../components/TodayResults';
import {
  WordleHistogram,
  ConnectionsHistogram,
  StrandsHistogram,
  MiniHistogram,
  LatimesMiniHistogram,
  BandleHistogram,
  CatfishingHistogram,
  TimeguessrHistogram,
  TravleHistogram,
  FlagleHistogram,
  KindahardgolfHistogram,
  EnclosehorseHistogram,
  KickoffleagueHistogram,
  ScrandleHistogram,
  OneuppuzzleHistogram,
  CluesbysamHistogram,
  MinutecrypticHistogram,
  DailydozenHistogram,
  MoreorlessHistogram,
  EruptleHistogram,
  ThriceHistogram,
} from '../components/GameHistogram';
import AddResultModal from '../components/AddResultModal';
import ScorecardModal from '../components/ScorecardModal';
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
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  const handleAddResult = () => {
    setIsModalOpen(true);
  };

  const handleGenerateScorecard = () => {
    setIsScorecardOpen(true);
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
          onGenerateScorecard={handleGenerateScorecard}
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
                {gamesWithResults.includes('strands') && (
                  <StrandsHistogram data={histograms.strands} />
                )}
                {gamesWithResults.includes('mini') && (
                  <MiniHistogram data={histograms.mini} />
                )}
                {gamesWithResults.includes('latimesmini') && (
                  <LatimesMiniHistogram data={histograms.latimesmini} />
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
                {gamesWithResults.includes('travle') && (
                  <TravleHistogram data={histograms.travle} />
                )}
                {gamesWithResults.includes('flagle') && (
                  <FlagleHistogram data={histograms.flagle} />
                )}
                {gamesWithResults.includes('kindahardgolf') && (
                  <KindahardgolfHistogram data={histograms.kindahardgolf} />
                )}
                {gamesWithResults.includes('enclosehorse') && (
                  <EnclosehorseHistogram data={histograms.enclosehorse} />
                )}
                {gamesWithResults.includes('kickoffleague') && (
                  <KickoffleagueHistogram data={histograms.kickoffleague} />
                )}
                {gamesWithResults.includes('scrandle') && (
                  <ScrandleHistogram data={histograms.scrandle} />
                )}
                {gamesWithResults.includes('oneuppuzzle') && (
                  <OneuppuzzleHistogram data={histograms.oneuppuzzle} />
                )}
                {gamesWithResults.includes('cluesbysam') && (
                  <CluesbysamHistogram data={histograms.cluesbysam} />
                )}
                {gamesWithResults.includes('minutecryptic') && (
                  <MinutecrypticHistogram data={histograms.minutecryptic} />
                )}
                {gamesWithResults.includes('dailydozen') && (
                  <DailydozenHistogram data={histograms.dailydozen} />
                )}
                {gamesWithResults.includes('moreorless') && (
                  <MoreorlessHistogram data={histograms.moreorless} />
                )}
                {gamesWithResults.includes('eruptle') && (
                  <EruptleHistogram data={histograms.eruptle} />
                )}
                {gamesWithResults.includes('thrice') && (
                  <ThriceHistogram data={histograms.thrice} />
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

      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        results={todayResults}
      />
    </main>
  );
}

export default UserPage;
