import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { TutorialProvider } from './contexts/TutorialContext'

// Ignore specific React warnings in development
if (import.meta.env.DEV && typeof window !== 'undefined' && !window.__reactKeyWarningPatched) {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered two children with the same key')) {
      return; // Ignore key warnings for now while we fix them
    }
    originalError.call(console, ...args);
  };
  window.__reactKeyWarningPatched = true;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <TutorialProvider>
        <App />
      </TutorialProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
