'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Table, Button, Space, message, Popconfirm, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { TripWithData } from '@/lib/schemas'
import { formatDate } from '@/lib/utils/format'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/utils/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '@ant-design/v5-patch-for-react-19'

const { Title } = Typography

export default function TripsPage() {
  const [trips, setTrips] = useState<TripWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { locale } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchTrips = useCallback(async () => {
    try {
      const res = await fetch('/api/trips')
      const data = await res.json()
      setTrips(data)
    } catch {
      message.error(t('error_occurred', locale))
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/trips/${id}`, { method: 'DELETE' })
        message.success(t('success_deleted', locale))
        fetchTrips()
      } catch {
        message.error(t('error_occurred', locale))
      }
    },
    [fetchTrips, locale]
  )

  const columns = useMemo(
    () => [
      {
        title: t('trip_title', locale),
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: TripWithData) => (
          <Link href={`/trips/${record.id}/edit`} style={{ color: '#1890ff' }}>
            {text}
          </Link>
        ),
      },
      {
        title: t('destination', locale),
        dataIndex: 'destination',
        key: 'destination',
      },
      {
        title: t('start_date', locale) + ' - ' + t('end_date', locale),
        key: 'dates',
        render: (_: unknown, record: TripWithData) =>
          `${formatDate(record.startDate)} - ${formatDate(record.endDate)}`,
      },
      {
        title: t('days', locale),
        key: 'days',
        render: (_: unknown, record: TripWithData) => record.days.length,
      },
      {
        title: t('edit', locale),
        key: 'actions',
        render: (_: unknown, record: TripWithData) => (
          <Space>
            <Link href={`/trips/${record.id}/edit`}>
              <Button icon={<EditOutlined />} size="small">
                {t('edit', locale)}
              </Button>
            </Link>
            <Popconfirm
              title={t('delete_trip', locale) + '?'}
              description={t('delete_trip_confirm', locale)}
              onConfirm={() => handleDelete(record.id)}
              okText={t('confirm', locale)}
              cancelText={t('cancel', locale)}
            >
              <Button danger icon={<DeleteOutlined />} size="small">
                {t('delete', locale)}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [locale, handleDelete]
  )

  if (!mounted) {
    return null
  }

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f7f9fc 0%, #ffffff 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <LanguageSwitcher />
        </div>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              paddingTop: 8,
            }}
          >
            <Title level={2} style={{ margin: 0, fontSize: 32 }}>
              {t('trips_list', locale)}
            </Title>
            <Space>
              <Link href="/trips/new">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    borderRadius: 8,
                    height: 40,
                  }}
                >
                  {t('create_trip', locale)}
                </Button>
              </Link>
            </Space>
          </div>
          <Table
            columns={columns}
            dataSource={trips}
            loading={loading}
            rowKey="id"
            style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
          />
        </Space>
      </div>
    </div>
  )
}
