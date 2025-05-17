import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext';
import { SupabaseProvider } from "./contexts/SupabaseContext" // import contexts

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <UserProvider> {/* wrap App in context */}
          <App />
        </UserProvider>
      </SupabaseProvider>
    </BrowserRouter>
  </StrictMode>
);
