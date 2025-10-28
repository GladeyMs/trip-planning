'use client'

import Link from 'next/link'
import { Button, Typography, Space, Card } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/utils/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '@ant-design/v5-patch-for-react-19'

const { Title, Paragraph } = Typography

export default function Home() {
  const { locale } = useLanguage()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
      }}
    >
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>
      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        variant="borderless"
      >
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <Title level={1} style={{ marginBottom: 16, fontSize: 48 }}>
              🌏 {t('app_name', locale)}
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#666' }}>
              Plan your trips, organize activities, manage transportation, and track your budget all
              in one place.
            </Paragraph>
          </div>

          <Space size="large" style={{ marginTop: 24 }}>
            <Link href="/trips/new">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                style={{
                  height: 48,
                  borderRadius: 24,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 16,
                }}
              >
                {t('create_trip', locale)}
              </Button>
            </Link>
            <Link href="/trips">
              <Button
                size="large"
                icon={<UnorderedListOutlined />}
                style={{
                  height: 48,
                  borderRadius: 24,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontSize: 16,
                }}
              >
                {t('trips_list', locale)}
              </Button>
            </Link>
          </Space>

          <Paragraph type="secondary" style={{ marginTop: 32, fontSize: 14 }}>
            A minimal, personal-only trip planning app with file-based storage. No authentication
            required.
          </Paragraph>
        </Space>
      </Card>
    </div>
  )
}
