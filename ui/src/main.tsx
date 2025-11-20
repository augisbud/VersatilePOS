import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import '@ant-design/v5-patch-for-react-19';
import { initializeApiClient } from './utils/apiClient';

initializeApiClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
