import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { compareSkinImages } from '@/lib/gemini'
import { generateProgressMessage } from '@/lib/mistral'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all scans ordered by date
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ scans: scans || [] })

  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scan_id_start, scan_id_end } = await request.json()

    // Get both scans
    const [startScan, endScan] = await Promise.all([
      supabase.from('scans').select('*').eq('id', scan_id_start).single(),
      supabase.from('scans').select('*').eq('id', scan_id_end).single(),
    ])

    if (!startScan.data || !endScan.data) {
      return NextResponse.json({ error: 'Scans not found' }, { status: 404 })
    }

    const start = startScan.data
    const end = endScan.data

    // Calculate score improvements
    const improvements = {
      pore: Math.round(((end.pore_score - start.pore_score) / (start.pore_score || 1)) * 100),
      inflammation: Math.round(((end.inflammation_score - start.inflammation_score) / (start.inflammation_score || 1)) * 100),
      hydration: Math.round(((end.hydration_score - start.hydration_score) / (start.hydration_score || 1)) * 100),
      overall: Math.round(((end.overall_score - start.overall_score) / (start.overall_score || 1)) * 100),
    }

    // Generate motivational message with Mistral
    const motivationalMessage = await generateProgressMessage(improvements)

    // Save progress report
    const { data: report } = await supabase
      .from('progress_reports')
      .insert({
        user_id: user.id,
        start_scan_id: scan_id_start,
        end_scan_id: scan_id_end,
        pore_improvement: improvements.pore,
        inflammation_improvement: improvements.inflammation,
        hydration_improvement: improvements.hydration,
        overall_improvement: improvements.overall,
        motivational_message: motivationalMessage,
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      report,
      improvements,
      motivational_message: motivationalMessage,
      start_scan: start,
      end_scan: end,
    })

  } catch (error) {
    console.error('Progress report error:', error)
    return NextResponse.json({ error: 'Progress report failed' }, { status: 500 })
  }
}
