import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import MainPage from './pages/MainPage/MainPage';
import LoginFailPage from './pages/LoginFailPage/LoginFailPage';
import TermsPage from './pages/TermsPage/TermsPage';
import AccountCreationPage from './pages/AccountCreationPage/AccountCreationPage';
import MyPage from './pages/MyPage/MyPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login-fail" element={<LoginFailPage />} />
        <Route path="/create-account" element={<AccountCreationPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="*" element={<NotFoundPage />} /> {/* 404 fallback */}
      </Routes>
    </div>
    
  );
  
}
