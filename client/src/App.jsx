import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrentUserProvider } from './hooks/useCurrentUser';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import './App.css';

function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <Routes>
            <Route path="*" element={<MainPage />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </CurrentUserProvider>
  );
}

export default App;
