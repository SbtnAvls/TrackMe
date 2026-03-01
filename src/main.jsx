import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PrivacyProvider } from './context/PrivacyContext'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthGate from './components/Auth/AuthGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PrivacyProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </PrivacyProvider>
    </AuthProvider>
  </StrictMode>,
)
