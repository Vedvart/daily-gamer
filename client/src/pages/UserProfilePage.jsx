// UserProfilePage - View any user's profile
// Displays a user's game results and statistics

import { useParams, Link, useNavigate } from 'react-router-dom';
import useGameResults from '../hooks/useGameResults';
import useUsers from '../hooks/useUsers';
import { useCurrentUser } from '../hooks/useCurrentUser';
import UserAvatar from '../components/user/UserAvatar';
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
import './UserProfilePage.css';

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getUserSync } = useUsers();
  const { currentUserId } = useCurrentUser();

  const user = getUserSync(userId);
  const isOwnProfile = userId === currentUserId;

  const handleBack = () => {
    // Go back if there's history, otherwise go to groups
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/groups');
    }
  };

  // Load this user's results (read-only if viewing another user)
  const {
    todayResults,
    getAllHistograms,
    getGamesWithResults,
  } = useGameResults(userId, !isOwnProfile);

  // User not found
  if (!user) {
    return (
      <main className="user-profile-page">
        <div className="user-profile-page__container">
          <div className="user-profile-page__not-found">
            <h2>User Not Found</h2>
            <p>The user you're looking for doesn't exist.</p>
            <Link to="/dashboard" className="user-profile-page__back-link">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const histograms = getAllHistograms();
  const gamesWithResults = getGamesWithResults();
  const hasAnyHistogramData = gamesWithResults.length > 0;

  // Format join date
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <main className="user-profile-page" key={userId}>
      <div className="user-profile-page__container">
        {/* Breadcrumb */}
        <nav className="user-profile-page__breadcrumb">
          <button onClick={handleBack} className="user-profile-page__back-btn">
            ← Back
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{user.displayName}'s Profile</span>
        </nav>

        {/* Profile Header */}
        <div className="user-profile-page__header">
          <UserAvatar user={user} size="xlarge" />
          <div className="user-profile-page__info">
            <h1 className="user-profile-page__name">{user.displayName}</h1>
            <p className="user-profile-page__username">@{user.username}</p>
            <p className="user-profile-page__joined">Member since {joinDate}</p>
          </div>
          {isOwnProfile && (
            <Link to="/dashboard" className="user-profile-page__edit-link">
              Go to Dashboard
            </Link>
          )}
        </div>

        <div className="user-profile-page__content">
          {/* Today's Results */}
          <section>
            <h2 className="user-profile-page__section-title">Today's Results</h2>
            {todayResults.length > 0 ? (
              <TodayResults
                results={todayResults}
                onRemoveResult={() => {}} // Read-only for other users
                readOnly={!isOwnProfile}
              />
            ) : (
              <div className="user-profile-page__empty">
                <p>No results for today yet.</p>
              </div>
            )}
          </section>

          {/* Historical Stats */}
          <section>
            <h2 className="user-profile-page__section-title">Statistics</h2>
            {hasAnyHistogramData ? (
              <div className="user-profile-page__histograms">
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
              <div className="user-profile-page__empty">
                <p>No game history yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default UserProfilePage;
