import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { I18nProvider } from '@/i18n/I18nProvider.jsx'
import { AuthProvider } from '@/lib/auth.jsx'
import { Toaster } from '@/components/ui/sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster richColors closeButton position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
