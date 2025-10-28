'use client'

import React, { useState } from 'react'
import { Modal, Form, Input, Select, InputNumber, Button, Space, message } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import type { Transportation, TransportMode, Activity } from '@/lib/schemas'
import { haversine, estimateDurationMin, calculateArriveTime } from '@/lib/utils/distance'
import { formatDistance, formatDuration } from '@/lib/utils/format'
import { useLanguage } from '@/contexts/LanguageContext'
import { t, type Locale } from '@/lib/utils/i18n'

const { Option } = Select

interface TransportEditorProps {
  visible: boolean
  transport?: Transportation | null
  activities: Activity[]
  places?: Map<string, { lat: number; lng: number }>
  onSave: (data: Partial<Transportation>) => Promise<void>
  onCancel: () => void
  locale?: Locale
}

const getTransportModes = (locale: Locale): { value: TransportMode; label: string }[] => [
  { value: 'walk', label: `🚶 ${t('mode_walk', locale)}` },
  { value: 'bike', label: `🚴 ${t('mode_bike', locale)}` },
  { value: 'scooter', label: `🛴 ${t('mode_scooter', locale)}` },
  { value: 'car', label: `🚗 ${t('mode_car', locale)}` },
  { value: 'taxi', label: `🚕 ${t('mode_taxi', locale)}` },
  { value: 'bus', label: `🚌 ${t('mode_bus', locale)}` },
  { value: 'train', label: `🚆 ${t('mode_train', locale)}` },
  { value: 'metro', label: `🚇 ${t('mode_metro', locale)}` },
  { value: 'ferry', label: `⛴️ ${t('mode_ferry', locale)}` },
  { value: 'flight', label: `✈️ ${t('mode_flight', locale)}` },
  { value: 'other', label: t('mode_other', locale) },
]

export default function TransportEditor({
  visible,
  transport,
  activities,
  places,
  onSave,
  onCancel,
  locale: propLocale,
}: TransportEditorProps) {
  const { locale: contextLocale } = useLanguage()
  const locale = propLocale || contextLocale
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const transportModes = getTransportModes(locale)

  const handleRecalculate = () => {
    const fromId = form.getFieldValue('fromActivityId')
    const toId = form.getFieldValue('toActivityId')
    const mode = form.getFieldValue('mode')

    if (!fromId || !toId || !mode || !places) return

    const fromActivity = activities.find((a) => a.id === fromId)
    const toActivity = activities.find((a) => a.id === toId)

    if (!fromActivity?.placeId || !toActivity?.placeId) {
      message.warning(t('notes', locale))
      return
    }

    const fromPlace = places.get(fromActivity.placeId)
    const toPlace = places.get(toActivity.placeId)

    if (!fromPlace || !toPlace) {
      message.warning(t('notes', locale))
      return
    }

    const distance = haversine(fromPlace.lat, fromPlace.lng, toPlace.lat, toPlace.lng)
    const duration = estimateDurationMin(mode, distance)

    form.setFieldsValue({
      distanceKm: distance,
      durationMin: duration,
    })

    // Auto-calculate arrive time if depart time is set
    const departTime = form.getFieldValue('departTime')
    if (departTime) {
      const arriveTime = calculateArriveTime(departTime, duration)
      form.setFieldsValue({ arriveTime })
    }

    message.success(`Calculated: ${formatDistance(distance)}, ${formatDuration(duration)}`)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onSave(values)
      form.resetFields()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={transport ? t('edit_transport', locale) : t('add_transport', locale)}
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t('save', locale)}
      cancelText={t('cancel', locale)}
      width={600}
    >
      <Form form={form} layout="vertical" initialValues={transport || { mode: 'walk' }}>
        <Form.Item name="fromActivityId" label={t('from', locale) + ' ' + t('activity', locale)}>
          <Select placeholder={t('activity', locale)} allowClear>
            {activities.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="toActivityId" label={t('to', locale) + ' ' + t('activity', locale)}>
          <Select placeholder={t('activity', locale)} allowClear>
            {activities.map((a) => (
              <Option key={a.id} value={a.id}>
                {a.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="mode" label={t('transport_mode', locale)} rules={[{ required: true }]}>
          <Select>
            {transportModes.map((m) => (
              <Option key={m.value} value={m.value}>
                {m.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="provider" label={t('provider', locale)}>
          <Input placeholder="e.g., Grab, Vietnam Railways" />
        </Form.Item>

        <Space>
          <Form.Item name="distanceKm" label={t('distance', locale) + ' (km)'}>
            <InputNumber min={0} step={0.1} />
          </Form.Item>

          <Form.Item name="durationMin" label={t('duration', locale) + ' (min)'}>
            <InputNumber min={0} />
          </Form.Item>

          <Button icon={<SwapOutlined />} onClick={handleRecalculate} style={{ marginTop: 30 }}>
            {t('recalculate', locale)}
          </Button>
        </Space>

        <Space>
          <Form.Item name="departTime" label={t('depart_time', locale)}>
            <Input placeholder="HH:mm" />
          </Form.Item>

          <Form.Item name="arriveTime" label={t('arrive_time', locale)}>
            <Input placeholder="HH:mm" />
          </Form.Item>
        </Space>

        <Form.Item name="cost" label={t('cost', locale)}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="notes" label={t('notes', locale)}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
