'use client'

import { Button, Space } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  return (
    <Space
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 16px',
        borderRadius: 24,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <GlobalOutlined style={{ fontSize: 18, color: '#666' }} />
      <Button
        type={locale === 'en' ? 'primary' : 'text'}
        size="small"
        onClick={() => setLocale('en')}
        style={{
          borderRadius: 16,
          fontWeight: locale === 'en' ? 600 : 400,
        }}
      >
        EN
      </Button>
      <Button
        type={locale === 'th' ? 'primary' : 'text'}
        size="small"
        onClick={() => setLocale('th')}
        style={{
          borderRadius: 16,
          fontWeight: locale === 'th' ? 600 : 400,
        }}
      >
        TH
      </Button>
    </Space>
  )
}
