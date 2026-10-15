import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/bebas-neue/400.css';
import './styles/global.css';
import './styles/components.css';
import './styles/account.css';
import App from './app/App.jsx';
import { StatusProvider } from './state/StatusContext.jsx';
import { MyListProvider } from './state/MyListContext.jsx';
import { ReviewsProvider } from './state/ReviewsContext.jsx';
import { AuthProvider } from './state/AuthContext.jsx';
import { ProgressProvider } from './state/ProgressContext.jsx';
import { ProfileProvider } from './state/ProfileContext.jsx';
import { RemindersProvider } from './state/RemindersContext.jsx';
import { loadRemoteCatalog } from './data/remoteCatalog.js';

// Render with the bundled catalog now; swap in the Supabase copy when it arrives.
loadRemoteCatalog();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StatusProvider>
        <AuthProvider>
          <ProfileProvider>
            <MyListProvider>
              <ProgressProvider>
                <ReviewsProvider>
                  <RemindersProvider>
                    <App />
                  </RemindersProvider>
                </ReviewsProvider>
              </ProgressProvider>
            </MyListProvider>
          </ProfileProvider>
        </AuthProvider>
      </StatusProvider>
    </BrowserRouter>
  </StrictMode>,
);
