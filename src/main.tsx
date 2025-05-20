
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Auto-extract content from pages (on client side)
const autoExtractContent = async () => {
  try {
    // Skip extraction on admin and appointment pages
    const path = window.location.pathname;
    if (!path.includes('admin') && !path.includes('appointment')) {
      // Import the extractor dynamically to avoid bundling it when not needed
      const { extractAndStoreCurrentPage } = await import('./utils/contentExtractor');
      // Wait a bit for the page to fully render
      setTimeout(async () => {
        await extractAndStoreCurrentPage();
        console.log('Content extraction completed for:', path);
      }, 2000);
    }
  } catch (error) {
    console.error('Error auto-extracting content:', error);
  }
};

// Call the auto-extract function in production only
if (import.meta.env.PROD) {
  window.addEventListener('load', autoExtractContent);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
