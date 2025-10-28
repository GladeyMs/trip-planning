'use client'

import React from 'react'
import { Card, Typography, Space } from 'antd'
import type { Activity, Transportation } from '@/lib/schemas'
import { formatCurrency } from '@/lib/utils/format'
import { useLanguage } from '@/contexts/LanguageContext'
import { t } from '@/lib/utils/i18n'

const { Text, Title } = Typography

interface BudgetSummaryProps {
  activities: Activity[]
  transports: Transportation[]
  currency?: string
  title?: string
}

export default function BudgetSummary({
  activities,
  transports,
  currency = 'USD',
  title,
}: BudgetSummaryProps) {
  const { locale } = useLanguage()
  const activitiesCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0)
  const activityTransportsCost = activities.reduce((sum, a) => sum + (a.transport?.cost || 0), 0)
  const transportsCost = transports.reduce((sum, t) => sum + (t.cost || 0), 0)
  const totalCost = activitiesCost + activityTransportsCost + transportsCost

  return (
    <Card size="small">
      <Title level={5}>{title || t('budget', locale)}</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>{t('activities', locale)}:</Text>
          <Text strong>{formatCurrency(activitiesCost, currency)}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>{t('transportation', locale)}:</Text>
          <Text strong>{formatCurrency(activityTransportsCost + transportsCost, currency)}</Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <Text strong>{t('total_cost', locale)}:</Text>
          <Text strong type="success" style={{ fontSize: 16 }}>
            {formatCurrency(totalCost, currency)}
          </Text>
        </div>
      </Space>
    </Card>
  )
}
