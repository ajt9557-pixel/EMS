import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import AuthProvider from './context/authcontext.jsx'

const basename = window.location.hostname.includes('github.io') ? '/EMS' : '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)