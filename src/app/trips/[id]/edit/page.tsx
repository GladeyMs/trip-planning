'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  List,
  message,
  Spin,
  Empty,
  Modal,
  Form,
  Input,
  TimePicker,
  InputNumber,
  Popconfirm,
  Select,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import type { TripWithData, Activity, Transportation } from '@/lib/schemas'
import { formatDate, formatCurrency, formatDuration, formatDistance } from '@/lib/utils/format'
import BudgetSummary from '@/components/BudgetSummary'
import TransportEditor from '@/components/TransportEditor'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/utils/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import dayjs from 'dayjs'
import '@ant-design/v5-patch-for-react-19'

const { Title, Text, Paragraph } = Typography
const { Content, Sider } = Layout

interface ActivityFormValues {
  title: string
  category?: string
  startTime?: dayjs.Dayjs
  endTime?: dayjs.Dayjs
  cost?: number
  notes?: string
  // Location fields
  locationName?: string
  locationAddress?: string
  locationLat?: number
  locationLng?: number
  locationMapLink?: string
  // Transport fields
  transportMode?: string
  transportProvider?: string
  transportDepartTime?: dayjs.Dayjs
  transportArriveTime?: dayjs.Dayjs
  transportDistanceKm?: number
  transportDurationMin?: number
  transportCost?: number
  transportNotes?: string
}

export default function TripEditPage() {
  const params = useParams()
  const router = useRouter()
  const { locale } = useLanguage()
  const [trip, setTrip] = useState<TripWithData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [activityModal, setActivityModal] = useState(false)
  const [transportModal, setTransportModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [selectedDayId, setSelectedDayId] = useState<string>('')
  const [form] = Form.useForm()

  const fetchTrip = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${params.id}`)
      if (!res.ok) throw new Error('Trip not found')
      const data = await res.json()
      setTrip(data)
      if (data.days.length > 0) {
        setSelectedDayId(data.days[0].id)
      }
    } catch {
      message.error(t('error_loading', locale))
      router.push('/trips')
    } finally {
      setLoading(false)
    }
  }, [params.id, locale, router])

  useEffect(() => {
    fetchTrip()
  }, [fetchTrip])

  const handleExportPDF = async () => {
    if (!trip) return

    setExporting(true)
    try {
      const url = `/api/trips/${trip.id}/export-pdf?locale=${locale}`
      window.open(url, '_blank')
      message.success(t('export_pdf', locale))
    } catch {
      message.error(t('error_occurred', locale))
    } finally {
      setExporting(false)
    }
  }

  const handleAddDay = async () => {
    if (!trip) return

    // Calculate max allowed days based on travel dates
    const startDate = dayjs(trip.startDate)
    const endDate = dayjs(trip.endDate)
    const maxDays = endDate.diff(startDate, 'day') + 1 // +1 to include both start and end dates

    if (trip.days.length >= maxDays) {
      message.warning(`${t('days', locale)} ${maxDays} ${t('days', locale)}`)
      return
    }

    try {
      const lastDay = trip.days[trip.days.length - 1]
      const newDate = lastDay
        ? dayjs(lastDay.date).add(1, 'day').format('YYYY-MM-DD')
        : trip.startDate

      await fetch(`/api/trips/${trip.id}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, index: trip.days.length }),
      })

      message.success(t('success_created', locale))
      fetchTrip()
    } catch {
      message.error(t('error_occurred', locale))
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!trip) return

    // Prevent deleting the last day
    if (trip.days.length === 1) {
      message.warning(t('delete', locale) + ' ' + t('day', locale))
      return
    }

    try {
      const res = await fetch(`/api/days/${dayId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete day')

      message.success(t('success_deleted', locale))

      // If the deleted day was selected, select the first day
      if (selectedDayId === dayId) {
        const remainingDays = trip.days.filter((d) => d.id !== dayId)
        if (remainingDays.length > 0) {
          setSelectedDayId(remainingDays[0].id)
        }
      }

      fetchTrip()
    } catch {
      message.error(t('error_occurred', locale))
    }
  }

  const handleSaveActivity = async (values: ActivityFormValues) => {
    if (!trip) return

    try {
      // If no days exist, create the first day automatically
      let dayId = selectedDayId
      if (trip.days.length === 0) {
        const res = await fetch(`/api/trips/${trip.id}/days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: trip.startDate, index: 0 }),
        })

        if (!res.ok) throw new Error('Failed to create day')
        const newDay = await res.json()
        dayId = newDay.id
        message.success(t('success_created', locale))
      }

      const activityData: Record<string, unknown> = {
        dayId: dayId,
        title: values.title,
        category: values.category,
        notes: values.notes,
        cost: values.cost,
        startTime: values.startTime?.format('HH:mm'),
        endTime: values.endTime?.format('HH:mm'),
        order: editingActivity
          ? editingActivity.order
          : trip!.activities.filter((a) => a.dayId === dayId).length,
      }

      // Add location if provided
      if (values.locationName || values.locationLat || values.locationMapLink) {
        activityData.location = {
          name: values.locationName,
          address: values.locationAddress,
          lat: values.locationLat,
          lng: values.locationLng,
          mapLink: values.locationMapLink,
        }
      }

      // Add transport if provided
      if (values.transportMode) {
        activityData.transport = {
          mode: values.transportMode,
          provider: values.transportProvider,
          departTime: values.transportDepartTime?.format('HH:mm'),
          arriveTime: values.transportArriveTime?.format('HH:mm'),
          distanceKm: values.transportDistanceKm,
          durationMin: values.transportDurationMin,
          cost: values.transportCost,
          notes: values.transportNotes,
        }
      }

      if (editingActivity) {
        await fetch(`/api/activities/${editingActivity.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData),
        })
        message.success(t('success_updated', locale))
      } else {
        await fetch(`/api/days/${dayId}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData),
        })
        message.success(t('success_created', locale))
      }

      setActivityModal(false)
      setEditingActivity(null)
      form.resetFields()
      fetchTrip()
    } catch {
      message.error(t('error_occurred', locale))
    }
  }

  const handleDeleteActivity = async (id: string) => {
    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' })
      message.success(t('success_deleted', locale))
      fetchTrip()
    } catch {
      message.error(t('error_occurred', locale))
    }
  }

  const handleSaveTransport = async (data: Partial<Transportation>) => {
    try {
      await fetch(`/api/days/${selectedDayId}/transports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      message.success(t('success_created', locale))
      setTransportModal(false)
      fetchTrip()
    } catch {
      message.error(t('error_occurred', locale))
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (!trip) return null

  const selectedDay = trip.days.find((d) => d.id === selectedDayId)
  const dayActivities = trip.activities
    .filter((a) => a.dayId === selectedDayId)
    .sort((a, b) => a.order - b.order)
  const dayTransports = trip.transports.filter((t) => t.dayId === selectedDayId)

  return (
    <Layout style={{ minHeight: '100vh', background: '#f7f9fc', position: 'relative' }}>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <LanguageSwitcher />
      </div>
      <Sider
        width={320}
        style={{
          background: '#fff',
          padding: 24,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Link href="/trips">
            <Button icon={<ArrowLeftOutlined />} block style={{ borderRadius: 8, height: 40 }}>
              {t('trips', locale)}
            </Button>
          </Link>

          <Button
            icon={<FilePdfOutlined />}
            block
            style={{ borderRadius: 8, height: 40 }}
            type="primary"
            loading={exporting}
            onClick={handleExportPDF}
          >
            {exporting ? t('exporting', locale) : t('export_pdf', locale)}
          </Button>

          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
            }}
            styles={{ body: { padding: 16 } }}
          >
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              {trip.title}
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{trip.destination}</Text>
            <Paragraph style={{ marginTop: 8, marginBottom: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Paragraph>
          </Card>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text strong>{t('days', locale)}</Text>
              <Button
                type="link"
                size="small"
                onClick={handleAddDay}
                icon={<PlusOutlined />}
                style={{ padding: 0 }}
              >
                {t('add_day', locale)}
              </Button>
            </div>
            <List
              size="small"
              dataSource={trip.days}
              renderItem={(day, index) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: selectedDayId === day.id ? '#f0f2ff' : 'transparent',
                    border:
                      selectedDayId === day.id ? '1px solid #597ef7' : '1px solid transparent',
                    marginBottom: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    onClick={() => setSelectedDayId(day.id)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text strong>
                      {t('day', locale)} {index + 1}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(day.date, 'MMM D')}
                    </Text>
                  </div>
                  {trip.days.length > 1 && (
                    <Popconfirm
                      title={t('delete', locale) + ' ' + t('day', locale) + '?'}
                      description={t('delete_trip_confirm', locale)}
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        handleDeleteDay(day.id)
                      }}
                      okText={t('delete', locale)}
                      cancelText={t('cancel', locale)}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginLeft: 8 }}
                      />
                    </Popconfirm>
                  )}
                </List.Item>
              )}
            />
          </div>

          <BudgetSummary
            activities={trip.activities}
            transports={trip.transports}
            currency={trip.currency}
            title={t('budget', locale)}
          />
        </Space>
      </Sider>

      <Content style={{ padding: 32 }}>
        <Card
          title={
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              {trip.days.length > 0
                ? `${t('day', locale)} ${trip.days.findIndex((d) => d.id === selectedDayId) + 1} - ${selectedDay ? formatDate(selectedDay.date) : ''}`
                : t('activities', locale)}
            </span>
          }
          extra={
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingActivity(null)
                  form.resetFields()
                  setActivityModal(true)
                }}
                style={{ borderRadius: 8 }}
              >
                {t('add_activity', locale)}
              </Button>
              {trip.days.length > 0 && (
                <Button
                  icon={<CarOutlined />}
                  onClick={() => setTransportModal(true)}
                  style={{ borderRadius: 8 }}
                >
                  {t('add_transport', locale)}
                </Button>
              )}
            </Space>
          }
          style={{
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          }}
          variant="borderless"
        >
          {dayActivities.length === 0 ? (
            <Empty
              description={
                trip.days.length === 0 ? t('no_activities', locale) : t('no_activities', locale)
              }
            />
          ) : (
            <List
              dataSource={dayActivities}
              renderItem={(activity) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingActivity(activity)
                        form.setFieldsValue({
                          title: activity.title,
                          category: activity.category,
                          cost: activity.cost,
                          notes: activity.notes,
                          startTime: activity.startTime ? dayjs(activity.startTime, 'HH:mm') : null,
                          endTime: activity.endTime ? dayjs(activity.endTime, 'HH:mm') : null,
                          // Location fields
                          locationName: activity.location?.name,
                          locationAddress: activity.location?.address,
                          locationLat: activity.location?.lat,
                          locationLng: activity.location?.lng,
                          locationMapLink: activity.location?.mapLink,
                          // Transport fields
                          transportMode: activity.transport?.mode,
                          transportProvider: activity.transport?.provider,
                          transportDepartTime: activity.transport?.departTime
                            ? dayjs(activity.transport.departTime, 'HH:mm')
                            : null,
                          transportArriveTime: activity.transport?.arriveTime
                            ? dayjs(activity.transport.arriveTime, 'HH:mm')
                            : null,
                          transportDistanceKm: activity.transport?.distanceKm,
                          transportDurationMin: activity.transport?.durationMin,
                          transportCost: activity.transport?.cost,
                          transportNotes: activity.transport?.notes,
                        })
                        setActivityModal(true)
                      }}
                    />,
                    <Popconfirm
                      key="delete"
                      title={t('delete', locale) + ' ' + t('activity', locale) + '?'}
                      onConfirm={() => handleDeleteActivity(activity.id)}
                      okText={t('confirm', locale)}
                      cancelText={t('cancel', locale)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{activity.title}</Text>
                        {activity.category && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ({activity.category})
                          </Text>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {activity.transport && (
                          <Space style={{ fontSize: 12 }}>
                            <CarOutlined />
                            <Text type="secondary">
                              {activity.transport.mode?.toUpperCase()}
                              {activity.transport.provider && ` via ${activity.transport.provider}`}
                              {activity.transport.durationMin &&
                                ` • ${formatDuration(activity.transport.durationMin)}`}
                              {activity.transport.cost !== undefined &&
                                ` • ${formatCurrency(activity.transport.cost, trip.currency)}`}
                            </Text>
                          </Space>
                        )}
                        {activity.location && (
                          <Space style={{ fontSize: 12 }}>
                            <EnvironmentOutlined />
                            {activity.location.mapLink ? (
                              <a
                                href={activity.location.mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1890ff' }}
                              >
                                {activity.location.name || 'View on map'}
                                {activity.location.address && ` • ${activity.location.address}`}
                              </a>
                            ) : (
                              <Text type="secondary">
                                {activity.location.name}
                                {activity.location.address && ` • ${activity.location.address}`}
                              </Text>
                            )}
                          </Space>
                        )}
                        {(activity.startTime || activity.endTime) && (
                          <Text type="secondary">
                            {activity.startTime} {activity.endTime && `- ${activity.endTime}`}
                          </Text>
                        )}
                        {activity.notes && <Text type="secondary">{activity.notes}</Text>}
                        {activity.cost !== undefined && (
                          <Text strong>{formatCurrency(activity.cost, trip.currency)}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          {dayTransports.length > 0 && (
            <>
              <Title level={5} style={{ marginTop: 24 }}>
                {t('transportation', locale)}
              </Title>
              <List
                dataSource={dayTransports}
                renderItem={(transport) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CarOutlined style={{ fontSize: 24 }} />}
                      title={
                        <Space>
                          <Text strong>{transport.mode.toUpperCase()}</Text>
                          {transport.provider && (
                            <Text type="secondary">({transport.provider})</Text>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          {transport.distanceKm && (
                            <Text type="secondary">
                              {formatDistance(transport.distanceKm)}
                              {transport.durationMin &&
                                ` • ${formatDuration(transport.durationMin)}`}
                            </Text>
                          )}
                          {(transport.departTime || transport.arriveTime) && (
                            <Text type="secondary">
                              {transport.departTime} → {transport.arriveTime}
                            </Text>
                          )}
                          {transport.notes && <Text type="secondary">{transport.notes}</Text>}
                          {transport.cost !== undefined && (
                            <Text strong>{formatCurrency(transport.cost, trip.currency)}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>
      </Content>

      <Modal
        title={editingActivity ? t('edit_activity', locale) : t('add_activity', locale)}
        open={activityModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setActivityModal(false)
          setEditingActivity(null)
          form.resetFields()
        }}
        okText={t('save', locale)}
        cancelText={t('cancel', locale)}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveActivity}>
          <Form.Item name="title" label={t('activity_title', locale)} rules={[{ required: true }]}>
            <Input placeholder="e.g., Visit Museum" />
          </Form.Item>
          <Form.Item name="category" label={t('category', locale)}>
            <Input placeholder="e.g., Sightseeing, Food, Activity" />
          </Form.Item>
          <Space>
            <Form.Item name="startTime" label={t('start_time', locale)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
            <Form.Item name="endTime" label={t('end_time', locale)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Space>
          <Form.Item name="cost" label={t('cost', locale)}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t('notes', locale)}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Divider orientation="left">
            {t('place', locale)} ({t('notes', locale)})
          </Divider>
          <Form.Item name="locationName" label={t('place', locale)}>
            <Input placeholder="e.g., Louvre Museum" />
          </Form.Item>
          <Form.Item name="locationAddress" label={t('place', locale)}>
            <Input placeholder="e.g., Rue de Rivoli, 75001 Paris" />
          </Form.Item>
          <Form.Item
            name="locationMapLink"
            label={t('map', locale)}
            tooltip="Paste a Google Maps link or any map URL"
          >
            <Input placeholder="e.g., https://maps.google.com/..." />
          </Form.Item>
          <Space>
            <Form.Item name="locationLat" label={t('place', locale) + ' Lat'}>
              <InputNumber placeholder="48.8606" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="locationLng" label={t('place', locale) + ' Lng'}>
              <InputNumber placeholder="2.3376" style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Divider orientation="left">
            {t('transportation', locale)} ({t('notes', locale)})
          </Divider>
          <Form.Item name="transportMode" label={t('transport_mode', locale)}>
            <Select placeholder={t('transport_mode', locale)} allowClear>
              <Select.Option value="walk">{t('mode_walk', locale)}</Select.Option>
              <Select.Option value="bike">{t('mode_bike', locale)}</Select.Option>
              <Select.Option value="scooter">{t('mode_scooter', locale)}</Select.Option>
              <Select.Option value="car">{t('mode_car', locale)}</Select.Option>
              <Select.Option value="taxi">{t('mode_taxi', locale)}</Select.Option>
              <Select.Option value="bus">{t('mode_bus', locale)}</Select.Option>
              <Select.Option value="train">{t('mode_train', locale)}</Select.Option>
              <Select.Option value="metro">{t('mode_metro', locale)}</Select.Option>
              <Select.Option value="ferry">{t('mode_ferry', locale)}</Select.Option>
              <Select.Option value="flight">{t('mode_flight', locale)}</Select.Option>
              <Select.Option value="other">{t('mode_other', locale)}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="transportProvider" label={t('provider', locale)}>
            <Input placeholder="e.g., Uber, Grab, Bus #42" />
          </Form.Item>
          <Space>
            <Form.Item name="transportDepartTime" label={t('depart_time', locale)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
            <Form.Item name="transportArriveTime" label={t('arrive_time', locale)}>
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="transportDistanceKm" label={t('distance', locale) + ' (km)'}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="transportDurationMin" label={t('duration', locale) + ' (min)'}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="transportCost" label={t('cost', locale)}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item name="transportNotes" label={t('notes', locale)}>
            <Input.TextArea rows={2} placeholder="e.g., Book in advance" />
          </Form.Item>
        </Form>
      </Modal>

      <TransportEditor
        visible={transportModal}
        activities={dayActivities}
        onSave={handleSaveTransport}
        onCancel={() => setTransportModal(false)}
        locale={locale}
      />
    </Layout>
  )
}
