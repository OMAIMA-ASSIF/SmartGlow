import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage, buildRoutineReminderMessage, buildProgressReportMessage } from '@/lib/whatsapp'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, phone_number, time_of_day, weather_tip, progress_improvement } = body

    // Get user name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, whatsapp_number')
      .eq('user_id', user.id)
      .single()

    const name = profile?.full_name?.split(' ')[0] || 'Belle'
    const phone = phone_number || profile?.whatsapp_number

    if (!phone) {
      return NextResponse.json({ error: 'No phone number provided' }, { status: 400 })
    }

    let message = ''
    if (type === 'routine_reminder') {
      message = buildRoutineReminderMessage(name, time_of_day || 'morning', weather_tip)
    } else if (type === 'progress_report') {
      message = buildProgressReportMessage(name, progress_improvement || 0)
    } else {
      return NextResponse.json({ error: 'Invalid message type' }, { status: 400 })
    }

    const result = await sendWhatsAppMessage(phone, message)

    // Update WhatsApp subscription in profile
    if (phone_number) {
      await supabase
        .from('profiles')
        .update({ whatsapp_number: phone_number, whatsapp_active: true })
        .eq('user_id', user.id)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('WhatsApp error:', error)
    return NextResponse.json({ error: 'WhatsApp send failed' }, { status: 500 })
  }
}
