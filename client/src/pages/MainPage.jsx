import { useState } from 'react';
import useGameResults from '../hooks/useGameResults';
import TodayResults from '../components/TodayResults';
import ScorecardPanel from '../components/ScorecardPanel';
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
import './MainPage.css';

function MainPage() {
  const {
    todayResults,
    addResult,
    removeResult,
    getAllHistograms,
    getGamesWithResults,
    clearAll,
  } = useGameResults();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const histograms = getAllHistograms();
  const gamesWithResults = getGamesWithResults();
  const hasAnyHistogramData = gamesWithResults.length > 0;

  const handleClearAll = () => {
    if (window.confirm('Clear all stored results? This cannot be undone.')) {
      clearAll();
    }
  };

  return (
    <main className="main-page">
      <div className="main-page__container">

        <div className="main-page__toolbar">
          <button
            className="main-page__add-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Add Results
          </button>
        </div>

        {/* Two-column layout: results left, scorecard right */}
        <div className="main-page__layout">
          <div className="main-page__left">
            <TodayResults
              results={todayResults}
              onRemoveResult={removeResult}
            />
          </div>
          <div className="main-page__right">
            <ScorecardPanel results={todayResults} />
          </div>
        </div>

        {/* All-time stats below */}
        <section className="main-page__stats">
          <h2 className="main-page__section-title">All-Time Stats</h2>
          {hasAnyHistogramData ? (
            <div className="main-page__histograms">
              {gamesWithResults.includes('wordle') && <WordleHistogram data={histograms.wordle} />}
              {gamesWithResults.includes('connections') && <ConnectionsHistogram data={histograms.connections} />}
              {gamesWithResults.includes('strands') && <StrandsHistogram data={histograms.strands} />}
              {gamesWithResults.includes('mini') && <MiniHistogram data={histograms.mini} />}
              {gamesWithResults.includes('latimesmini') && <LatimesMiniHistogram data={histograms.latimesmini} />}
              {gamesWithResults.includes('bandle') && <BandleHistogram data={histograms.bandle} />}
              {gamesWithResults.includes('catfishing') && <CatfishingHistogram data={histograms.catfishing} />}
              {gamesWithResults.includes('timeguessr') && <TimeguessrHistogram data={histograms.timeguessr} />}
              {gamesWithResults.includes('travle') && <TravleHistogram data={histograms.travle} />}
              {gamesWithResults.includes('flagle') && <FlagleHistogram data={histograms.flagle} />}
              {gamesWithResults.includes('kindahardgolf') && <KindahardgolfHistogram data={histograms.kindahardgolf} />}
              {gamesWithResults.includes('enclosehorse') && <EnclosehorseHistogram data={histograms.enclosehorse} />}
              {gamesWithResults.includes('kickoffleague') && <KickoffleagueHistogram data={histograms.kickoffleague} />}
              {gamesWithResults.includes('scrandle') && <ScrandleHistogram data={histograms.scrandle} />}
              {gamesWithResults.includes('oneuppuzzle') && <OneuppuzzleHistogram data={histograms.oneuppuzzle} />}
              {gamesWithResults.includes('cluesbysam') && <CluesbysamHistogram data={histograms.cluesbysam} />}
              {gamesWithResults.includes('minutecryptic') && <MinutecrypticHistogram data={histograms.minutecryptic} />}
              {gamesWithResults.includes('dailydozen') && <DailydozenHistogram data={histograms.dailydozen} />}
              {gamesWithResults.includes('moreorless') && <MoreorlessHistogram data={histograms.moreorless} />}
              {gamesWithResults.includes('eruptle') && <EruptleHistogram data={histograms.eruptle} />}
              {gamesWithResults.includes('thrice') && <ThriceHistogram data={histograms.thrice} />}
            </div>
          ) : (
            <div className="main-page__empty-histograms">
              <p>No historical data yet.</p>
              <p className="main-page__empty-hint">Add results to see your stats over time.</p>
            </div>
          )}
        </section>

        <div className="main-page__debug">
          <button className="main-page__debug-button" onClick={handleClearAll}>
            Clear All Data
          </button>
        </div>
      </div>

      <AddResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResultParsed={addResult}
      />
    </main>
  );
}

export default MainPage;
