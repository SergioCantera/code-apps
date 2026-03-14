import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import PowerProvider from './PowerProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </React.StrictMode>
);
