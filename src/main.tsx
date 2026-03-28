import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { COLORS } from '@/constants/colors'

document.body.style.margin = '0'
document.body.style.backgroundColor = COLORS.bg
document.body.style.color = COLORS.text
document.body.style.fontFamily =
  '"Source Sans 3", "Segoe UI", sans-serif'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
