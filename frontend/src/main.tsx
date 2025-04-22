import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext'; // import context

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider> {/* wrap App in context */}
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
