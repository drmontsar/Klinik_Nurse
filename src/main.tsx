import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'

document.body.style.margin = '0'
document.body.style.backgroundColor = '#0A0E1A'
document.body.style.fontFamily =
  '"SF Pro Text", "Segoe UI", sans-serif'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
