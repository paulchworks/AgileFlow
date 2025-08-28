import '@/setup/sanitizeDatesAtRuntime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// Runtime shim: ensure a global service exists with .list/.create
import Project from '@/api/entities';
if (typeof window !== 'undefined') {
  window.__AgileFlowProjectAPI = Project;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

