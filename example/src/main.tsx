import React from 'react';
window.addEventListener('error', (e) => {
    document.body.innerHTML = `<div style="background:red;color:white;padding:20px;font-family:monospace;z-index:99999;position:absolute;top:0;left:0;right:0;bottom:0;"><h1>Global Error</h1><pre>${e.error?.stack || e.message}</pre></div>`;
});

import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
