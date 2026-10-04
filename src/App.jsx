import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppRoutes } from './routes/AppRoutes'

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
