import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { getTripById } from '@/lib/data/trips'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import type { TripWithData } from '@/lib/schemas'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trip = await getTripById(id)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Get locale from query params
    const url = new URL(request.url)
    const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'th'

    // Generate HTML for PDF
    const html = generateTripHTML(trip, locale)

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    await browser.close()

    // Return PDF
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${trip.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generateTripHTML(trip: TripWithData, locale: 'en' | 'th') {
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        trip_itinerary: 'Trip Itinerary',
        destination: 'Destination',
        dates: 'Dates',
        currency: 'Currency',
        total_budget: 'Total Budget',
        day: 'Day',
        activities: 'Activities',
        time: 'Time',
        location: 'Location',
        transport: 'Transport',
        cost: 'Cost',
        notes: 'Notes',
        no_activities: 'No activities planned',
        budget_summary: 'Budget Summary',
        activities_cost: 'Activities',
        transport_cost: 'Transportation',
        total_cost: 'Total Cost',
      },
      th: {
        trip_itinerary: 'แผนการเดินทาง',
        destination: 'จุดหมายปลายทาง',
        dates: 'วันที่',
        currency: 'สกุลเงิน',
        total_budget: 'งบประมาณทั้งหมด',
        day: 'วันที่',
        activities: 'กิจกรรม',
        time: 'เวลา',
        location: 'สถานที่',
        transport: 'การเดินทาง',
        cost: 'ค่าใช้จ่าย',
        notes: 'หมายเหตุ',
        no_activities: 'ยังไม่มีกิจกรรม',
        budget_summary: 'สรุปงบประมาณ',
        activities_cost: 'กิจกรรม',
        transport_cost: 'การเดินทาง',
        total_cost: 'รวมทั้งหมด',
      },
    }
    return translations[locale][key] || key
  }

  const activitiesCost = trip.activities.reduce((sum: number, a) => sum + (a.cost || 0), 0)
  const activityTransportsCost = trip.activities.reduce(
    (sum: number, a) => sum + (a.transport?.cost || 0),
    0
  )
  const transportsCost = trip.transports.reduce((sum: number, t) => sum + (t.cost || 0), 0)
  const totalCost = activitiesCost + activityTransportsCost + transportsCost

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .header-info {
          display: flex;
          gap: 30px;
          margin-top: 15px;
          font-size: 14px;
        }
        .header-info-item {
          opacity: 0.95;
        }
        .header-info-item strong {
          display: block;
          margin-bottom: 5px;
          opacity: 0.8;
        }
        .budget-summary {
          background: #f7f9fc;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .budget-summary h2 {
          font-size: 20px;
          margin-bottom: 15px;
          color: #667eea;
        }
        .budget-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .budget-row:last-child {
          border-bottom: none;
          border-top: 2px solid #667eea;
          margin-top: 10px;
          padding-top: 15px;
          font-weight: bold;
          font-size: 18px;
        }
        .day-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .day-header {
          background: #667eea;
          color: white;
          padding: 15px 20px;
          border-radius: 8px 8px 0 0;
          font-size: 18px;
          font-weight: 600;
        }
        .activity {
          background: white;
          border: 1px solid #e0e0e0;
          border-top: none;
          padding: 20px;
        }
        .activity:last-child {
          border-radius: 0 0 8px 8px;
        }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        .activity-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .activity-cost {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .activity-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
          font-size: 14px;
        }
        .detail-item {
          color: #666;
        }
        .detail-item strong {
          color: #333;
          margin-right: 5px;
        }
        .transport-badge {
          display: inline-block;
          background: #f0f2ff;
          color: #667eea;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          margin-top: 10px;
        }
        .notes {
          background: #fffef0;
          padding: 12px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 14px;
          color: #666;
          border-left: 3px solid #ffd700;
        }
        .no-activities {
          background: white;
          border: 1px dashed #ccc;
          border-top: none;
          padding: 30px;
          text-align: center;
          color: #999;
          border-radius: 0 0 8px 8px;
        }
        @media print {
          body { padding: 0; }
          .day-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌏 ${trip.title}</h1>
        <div class="header-info">
          <div class="header-info-item">
            <strong>${t('destination')}</strong>
            ${trip.destination}
          </div>
          <div class="header-info-item">
            <strong>${t('dates')}</strong>
            ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
          </div>
          <div class="header-info-item">
            <strong>${t('currency')}</strong>
            ${trip.currency}
          </div>
        </div>
      </div>

      <div class="budget-summary">
        <h2>${t('budget_summary')}</h2>
        <div class="budget-row">
          <span>${t('activities_cost')}</span>
          <strong>${formatCurrency(activitiesCost, trip.currency)}</strong>
        </div>
        <div class="budget-row">
          <span>${t('transport_cost')}</span>
          <strong>${formatCurrency(activityTransportsCost + transportsCost, trip.currency)}</strong>
        </div>
        <div class="budget-row">
          <span>${t('total_cost')}</span>
          <strong style="color: #667eea;">${formatCurrency(totalCost, trip.currency)}</strong>
        </div>
      </div>

      ${trip.days
        .map(
          (day, index: number) => `
        <div class="day-section">
          <div class="day-header">
            ${t('day')} ${index + 1} - ${formatDate(day.date)}
          </div>
          ${
            trip.activities.filter((a) => a.dayId === day.id).length === 0
              ? `<div class="no-activities">${t('no_activities')}</div>`
              : trip.activities
                  .filter((a) => a.dayId === day.id)
                  .sort((a, b) => a.order - b.order)
                  .map(
                    (activity) => `
            <div class="activity">
              <div class="activity-header">
                <div class="activity-title">${activity.title}</div>
                ${activity.cost ? `<div class="activity-cost">${formatCurrency(activity.cost, trip.currency)}</div>` : ''}
              </div>
              <div class="activity-details">
                ${activity.startTime || activity.endTime ? `<div class="detail-item"><strong>${t('time')}:</strong> ${activity.startTime || ''} ${activity.endTime ? '- ' + activity.endTime : ''}</div>` : ''}
                ${activity.location?.name ? `<div class="detail-item"><strong>${t('location')}:</strong> ${activity.location.name}${activity.location.address ? ', ' + activity.location.address : ''}</div>` : ''}
                ${activity.category ? `<div class="detail-item"><strong>Category:</strong> ${activity.category}</div>` : ''}
              </div>
              ${activity.transport ? `<div class="transport-badge">🚗 ${activity.transport.mode?.toUpperCase()}${activity.transport.provider ? ' via ' + activity.transport.provider : ''}${activity.transport.cost ? ' - ' + formatCurrency(activity.transport.cost, trip.currency) : ''}</div>` : ''}
              ${activity.notes ? `<div class="notes">${activity.notes}</div>` : ''}
            </div>
          `
                  )
                  .join('')
          }
        </div>
      `
        )
        .join('')}
    </body>
    </html>
  `
}
