import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrentUserProvider } from './hooks/useCurrentUser';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import UserProfilePage from './pages/UserProfilePage';
import GroupsListPage from './pages/GroupsListPage';
import GroupPage from './pages/GroupPage';
import GroupSettingsPage from './pages/GroupSettingsPage';
import UserSwitcher from './components/user/UserSwitcher';
import './App.css';

function App() {
  return (
    <CurrentUserProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<UserPage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/groups" element={<GroupsListPage />} />
            <Route path="/group/:groupId" element={<GroupPage />} />
            <Route path="/group/:groupId/settings" element={<GroupSettingsPage />} />
          </Routes>
          <Footer />
          <UserSwitcher />
        </div>
      </BrowserRouter>
    </CurrentUserProvider>
  );
}

export default App;
