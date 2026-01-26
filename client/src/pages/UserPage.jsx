import useGameResults from '../hooks/useGameResults';
import ResultInput from '../components/ResultInput';
import TodayResults from '../components/TodayResults';
import './UserPage.css';

function UserPage() {
  const { todayResults, addResult, removeResult } = useGameResults();

  const handleResultParsed = (result) => {
    addResult(result);
  };

  return (
    <main className="user-page">
      <div className="user-page__container">
        <section className="user-page__input-section">
          <ResultInput onResultParsed={handleResultParsed} />
        </section>

        <section className="user-page__results-section">
          <TodayResults
            results={todayResults}
            onRemoveResult={removeResult}
          />
        </section>
      </div>
    </main>
  );
}

export default UserPage;
