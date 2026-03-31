import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeatherAndAirQuality } from '@/lib/openweather'
import { generateClimateRoutine } from '@/lib/mistral'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const maxDuration = 30

// Thresholds for automatic WhatsApp alerts
const ALERT_THRESHOLDS = {
  uv_high: 6,       // UV index > 6 → SPF50+ alert
  pm25_high: 25,    // PM2.5 > 25 µg/m³ → antioxidant alert
  humidity_low: 40, // Humidity < 40% → ceramide alert
  humidity_high: 75,// Humidity > 75% → lightweight texture alert
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lon } = body

    if (!lat || !lon) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    // Get user skin type, name, and WhatsApp settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('skin_type, full_name, whatsapp_number, whatsapp_active')
      .eq('user_id', user.id)
      .single()

    const skinType = profile?.skin_type || 'normal'

    // Fetch weather data
    const weather = await getWeatherAndAirQuality(lat, lon)

    // Generate climate-adapted routine with Mistral
    const routineResult = await generateClimateRoutine(
      {
        uv_index: weather.uv_index,
        pm25: weather.pm25,
        humidity: weather.humidity,
        temperature: weather.temperature,
        description: weather.description,
      },
      skinType
    )

    // Save climate log
    const { error: logError } = await supabase.from('climate_logs').insert({
      user_id: user.id,
      latitude: lat,
      longitude: lon,
      city: weather.city,
      uv_index: weather.uv_index,
      pm25: weather.pm25,
      humidity: weather.humidity,
      temperature: weather.temperature,
      weather_description: weather.description,
      routine_adjustments: routineResult.adjustments,
    })

    if (logError) console.error('Climate log error:', logError)

    // ========================================================
    // AUTO WHATSAPP ALERT if conditions exceed thresholds
    // ========================================================
    let whatsappSent = false
    let whatsappAlert: string | null = null

    if (profile?.whatsapp_active && profile?.whatsapp_number) {
      const firstName = profile.full_name?.split(' ')[0] || 'Belle'
      const alerts: string[] = []

      if (weather.uv_index > ALERT_THRESHOLDS.uv_high) {
        alerts.push(`☀️ *Indice UV élevé (${weather.uv_index})* : Applique ton SPF 50+ avant de sortir !`)
      }
      if (weather.pm25 > ALERT_THRESHOLDS.pm25_high) {
        alerts.push(`🏭 *Pollution élevée (PM2.5 : ${weather.pm25} µg/m³)* : Booste ta routine avec de la Vitamine C ou E pour un bouclier antioxydant.`)
      }
      if (weather.humidity < ALERT_THRESHOLDS.humidity_low) {
        alerts.push(`💧 *Air très sec (humidité : ${weather.humidity}%)* : Applique ta crème aux céramides pour renforcer ton film hydrolipidique.`)
      }
      if (weather.humidity > ALERT_THRESHOLDS.humidity_high) {
        alerts.push(`💦 *Air très humide (${weather.humidity}%)* : Privilégie des textures légères et évite les crèmes riches aujourd'hui.`)
      }

      if (alerts.length > 0) {
        whatsappAlert = alerts.join('\n')
        const message = `🌡️ *Alerte Climate-Sync SmartGlow* — Bonjour ${firstName} !\n\n${weather.description} à ${weather.city || 'ta position'}.\n\n${whatsappAlert}\n\n_SmartGlow – Ta routine protégée en temps réel_ 💗`

        const result = await sendWhatsAppMessage(profile.whatsapp_number, message)
        whatsappSent = result.success
        if (!result.success) {
          console.warn('WhatsApp auto-alert failed:', result.error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      weather,
      routine: routineResult,
      whatsapp_alert_sent: whatsappSent,
      whatsapp_alert: whatsappAlert,
    })

  } catch (error) {
    console.error('Climate sync error:', error)
    return NextResponse.json(
      { error: 'Climate sync failed. Please try again.' },
      { status: 500 }
    )
  }
}
