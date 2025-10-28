'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Locale, setLocale as setI18nLocale } from '@/lib/utils/i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import 'dayjs/locale/en'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'th')) {
      setI18nLocale(savedLocale)
      dayjs.locale(savedLocale)
      return savedLocale
    }
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setI18nLocale(newLocale)
    dayjs.locale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
