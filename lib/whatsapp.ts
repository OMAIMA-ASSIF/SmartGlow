const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_API_TOKEN

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp API credentials not configured')
    return { success: false, error: 'WhatsApp not configured' }
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''), // strip non-digits
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'WhatsApp send failed' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export function buildRoutineReminderMessage(
  name: string,
  timeOfDay: 'morning' | 'evening',
  weatherTip?: string
): string {
  const greeting = timeOfDay === 'morning' ? '🌸 Bonjour' : '🌙 Bonsoir'
  const routine = timeOfDay === 'morning' ? 'matinale' : 'du soir'

  let message = `${greeting} ${name} ! ✨\n\nC'est l'heure de ta routine ${routine} SmartGlow.\n`

  if (weatherTip) {
    message += `\n🌤️ *Conseil météo du jour :* ${weatherTip}\n`
  }

  message += `\nPrends soin de toi avec amour ! 💗\n\n_SmartGlow - Ton coach beauté intelligent_`

  return message
}

export function buildProgressReportMessage(
  name: string,
  overallImprovement: number
): string {
  const emoji = overallImprovement > 0 ? '📈' : '📊'
  const trend = overallImprovement > 0 ? `+${overallImprovement}%` : `${overallImprovement}%`

  return `${emoji} *Rapport SmartGlow* — ${name}\n\nTon evolution de peau ce mois : *${trend}*\n\nOuvre l'app pour voir ton rapport complet avec photos comparatives ! 🔬✨\n\n_SmartGlow - Suivi dermatologique intelligent_`
}
