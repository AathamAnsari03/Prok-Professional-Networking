import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { suppressConsoleWarnings } from './utils/consoleSuppression'
import { Toaster } from 'react-hot-toast';

// Suppress specific console warnings in development
suppressConsoleWarnings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" />
  </StrictMode>,
)
