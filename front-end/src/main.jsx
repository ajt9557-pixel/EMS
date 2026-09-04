import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import AuthProvider from './context/authcontext.jsx'
import ThemeContextProvider from './context/ThemeContext.jsx'

const basename = window.location.hostname.includes('github.io') ? '/EMS' : '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <ThemeContextProvider>
      <App />
      </ThemeContextProvider>
    </AuthProvider>
  </BrowserRouter>
 ,

  
)