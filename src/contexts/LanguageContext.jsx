import React, { createContext, useContext, useState, useEffect } from 'react'
import en from '../locales/en.json'
import ur from '../locales/ur.json'

const LanguageContext = createContext()

const translations = { en, ur }

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('medbridge_lang') || 'en'
  })

  const isRTL = language === 'ur'

  useEffect(() => {
    localStorage.setItem('medbridge_lang', language)
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    if (isRTL) {
      document.documentElement.classList.add('font-urdu')
    } else {
      document.documentElement.classList.remove('font-urdu')
    }
  }, [language, isRTL])

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'ur') {
      setLanguageState(lang)
    }
  }

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'ur' : 'en'))
  }

  // Helper function to resolve dot-notation path like 'brand.tagline'
  const t = (path, fallback = '') => {
    const keys = path.split('.')
    let current = translations[language]
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        // Fallback to english if not found in current language
        let fallbackVal = translations['en']
        for (const fKey of keys) {
          if (fallbackVal && fallbackVal[fKey] !== undefined) {
            fallbackVal = fallbackVal[fKey]
          } else {
            return fallback || path
          }
        }
        return fallbackVal || fallback || path
      }
    }
    return current
  }

  return (
    <LanguageContext.Provider value={{ language, isRTL, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
