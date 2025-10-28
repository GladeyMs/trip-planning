'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, DatePicker, Select, Button, Card, message, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { Dayjs } from 'dayjs'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/utils/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import '@ant-design/v5-patch-for-react-19'

const { RangePicker } = DatePicker

interface TripFormValues {
  title: string
  destination: string
  dates: [Dayjs, Dayjs]
  currency: string
}

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { locale } = useLanguage()

  const handleSubmit = async (values: TripFormValues) => {
    setLoading(true)
    try {
      const tripData = {
        title: values.title,
        destination: values.destination,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.dates[1].format('YYYY-MM-DD'),
        currency: values.currency || 'THB',
      }

      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      })

      if (!res.ok) throw new Error('Failed to create trip')

      const trip = await res.json()
      message.success(t('success_created', locale))
      router.push(`/trips/${trip.id}/edit`)
    } catch {
      message.error(t('error_occurred', locale))
    } finally {
      setLoading(false)
    }
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
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <LanguageSwitcher />
        </div>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Link href="/trips">
            <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 8 }}>
              {t('trips', locale)}
            </Button>
          </Link>

          <Card
            title={
              <span style={{ fontSize: 24, fontWeight: 600 }}>{t('create_trip', locale)}</span>
            }
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
            }}
            variant="borderless"
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="title"
                label={t('trip_title', locale)}
                rules={[{ required: true, message: t('trip_title', locale) }]}
              >
                <Input placeholder="e.g., Summer Vacation 2025" size="large" />
              </Form.Item>

              <Form.Item
                name="destination"
                label={t('destination', locale)}
                rules={[{ required: true, message: t('destination', locale) }]}
              >
                <Input placeholder="e.g., Bali, Indonesia" size="large" />
              </Form.Item>

              <Form.Item
                name="dates"
                label={t('start_date', locale) + ' - ' + t('end_date', locale)}
                rules={[{ required: true, message: t('start_date', locale) }]}
              >
                <RangePicker size="large" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="currency" label={t('currency', locale)} initialValue="THB">
                <Select size="large">
                  <Select.Option value="THB">THB - Thai Baht</Select.Option>
                  <Select.Option value="USD">USD - US Dollar</Select.Option>
                  <Select.Option value="EUR">EUR - Euro</Select.Option>
                  <Select.Option value="GBP">GBP - British Pound</Select.Option>
                  <Select.Option value="JPY">JPY - Japanese Yen</Select.Option>
                  <Select.Option value="CNY">CNY - Chinese Yuan</Select.Option>
                  <Select.Option value="VND">VND - Vietnamese Dong</Select.Option>
                  <Select.Option value="SGD">SGD - Singapore Dollar</Select.Option>
                  <Select.Option value="AUD">AUD - Australian Dollar</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} size="large">
                    {t('create_trip', locale)}
                  </Button>
                  <Link href="/trips">
                    <Button size="large">{t('cancel', locale)}</Button>
                  </Link>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </div>
  )
}
