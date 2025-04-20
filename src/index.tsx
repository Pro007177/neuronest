import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Import the wrapper component
import AppWrapper from './App'; // Assuming App.tsx exports AppWrapper as default
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS for dropdowns

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWrapper /> {/* Render the wrapper */}
  </React.StrictMode>
);

reportWebVitals();