import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeSkinImage } from '@/lib/gemini'
import { synthesizeSkinDiagnosis } from '@/lib/mistral'
import { generateSpeech } from '@/lib/elevenlabs'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile for personalized analysis
    const { data: profile } = await supabase
      .from('profiles')
      .select('age, skin_type, skin_concerns')
      .eq('user_id', user.id)
      .single()

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    // 1. Upload image to Supabase storage (optional)
    let imageUrl: string | null = null
    try {
      const fileName = `${user.id}/${Date.now()}.jpg`
      const { data: uploadData } = await supabase.storage
        .from('scan-images')
        .upload(fileName, imageFile, { contentType: 'image/jpeg', upsert: false })

      imageUrl = uploadData?.path
        ? supabase.storage.from('scan-images').getPublicUrl(uploadData.path).data.publicUrl
        : null
    } catch (uploadError) {
      console.warn('Image upload failed, continuing without storage:', uploadError)
      // Continue without image URL
    }

    // 2. Analyze with Gemini
    const geminiAnalysis = await analyzeSkinImage(base64Image)

    // 3. Synthesize with Mistral
    const synthesis = await synthesizeSkinDiagnosis(
      geminiAnalysis,
      profile?.skin_type || 'normal',
      profile?.age || 25
    )

    // 4. Generate audio with ElevenLabs
    let audioBase64: string | null = null
    try {
      const audioBuffer = await generateSpeech(synthesis.personalized_advice)
      audioBase64 = audioBuffer.toString('base64')

      // Optional: upload audio to Supabase
      // const audioFileName = `${user.id}/${Date.now()}.mp3`
      // await supabase.storage.from('audio-diagnostics').upload(audioFileName, audioBuffer)
    } catch (audioError) {
      console.error('ElevenLabs error:', audioError)
      // Continue without audio
    }

    // 5. Save scan to database (optional)
    let scan = null
    try {
      const scanData = {
        user_id: user.id,
        image_url: imageUrl,
        gemini_analysis: geminiAnalysis,
        mistral_synthesis: synthesis.personalized_advice,
        pore_score: geminiAnalysis.pore_dilation * 10,
        inflammation_score: Math.max(0, 100 - geminiAnalysis.acne_severity * 10),
        hydration_score: geminiAnalysis.hydration_level * 10,
        overall_score: geminiAnalysis.overall_health * 10,
      }

      const { data: scanResult, error: scanError } = await supabase
        .from('scans')
        .insert(scanData)
        .select()
        .single()

      if (scanError) {
        console.warn('Scan save failed, continuing:', scanError)
      } else {
        scan = scanResult
      }
    } catch (dbError) {
      console.warn('Database operation failed, continuing:', dbError)
    }

    return NextResponse.json({
      success: true,
      scan: scan || {
        user_id: user.id,
        image_url: imageUrl,
        gemini_analysis: geminiAnalysis,
        mistral_synthesis: synthesis.personalized_advice,
        pore_score: geminiAnalysis.pore_dilation * 10,
        inflammation_score: Math.max(0, 100 - geminiAnalysis.acne_severity * 10),
        hydration_score: geminiAnalysis.hydration_level * 10,
        overall_score: geminiAnalysis.overall_health * 10,
      },
      gemini_analysis: geminiAnalysis,
      synthesis,
      audio_base64: audioBase64,
    })

  } catch (error) {
    console.error('Skin analysis error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
