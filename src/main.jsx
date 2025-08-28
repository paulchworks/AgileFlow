// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// --- begin runtime shim (add these two lines) ---
import Project from '@/api/entities';
if (typeof window !== 'undefined') window.__AgileFlowProjectAPI = Project;
// --- end runtime shim ---

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
