import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/bebas-neue/400.css';
import './styles/global.css';
import './styles/components.css';
import App from './app/App.jsx';
import { StatusProvider } from './state/StatusContext.jsx';
import { MyListProvider } from './state/MyListContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StatusProvider>
        <MyListProvider>
          <App />
        </MyListProvider>
      </StatusProvider>
    </BrowserRouter>
  </StrictMode>,
);
