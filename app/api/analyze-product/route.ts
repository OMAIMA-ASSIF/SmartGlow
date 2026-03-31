import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeProductIngredients } from '@/lib/mistral'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inci_list, product_name, brand, barcode } = body

    if (!inci_list) {
      return NextResponse.json({ error: 'INCI list is required' }, { status: 400 })
    }

    // Get user profile (including age calculation from birth_date) and current routine
    const [profileResult, routineResult] = await Promise.all([
      supabase.from('profiles').select('skin_type, skin_concerns, age, birth_date').eq('user_id', user.id).single(),
      supabase.from('routines').select('active_ingredients, morning_products, evening_products').eq('user_id', user.id).single(),
    ])

    const skinType = profileResult.data?.skin_type || 'normal'
    const skinConcerns = profileResult.data?.skin_concerns || []
    const currentIngredients = routineResult.data?.active_ingredients || []

    // Calculate age from birth_date if available, otherwise use stored age
    let userAge: number | undefined = profileResult.data?.age ?? undefined
    if (profileResult.data?.birth_date) {
      const birth = new Date(profileResult.data.birth_date)
      const today = new Date()
      userAge = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) userAge--
    }

    const morningProducts = routineResult.data?.morning_products || []
    const eveningProducts = routineResult.data?.evening_products || []

    // Analyze with Mistral – fully personalized with age + routine
    const analysis = await analyzeProductIngredients(
      inci_list,
      currentIngredients,
      skinType,
      skinConcerns,
      userAge,
      morningProducts,
      eveningProducts
    )

    // Save product to database
    const routineProductNames = [
      ...(morningProducts as any[]).map((p: any) => typeof p === 'string' ? p : p.name),
      ...(eveningProducts as any[]).map((p: any) => typeof p === 'string' ? p : p.name),
    ]
    const isInRoutine = routineProductNames.includes(product_name)
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: product_name,
        brand,
        barcode,
        inci_list,
        safety_score: analysis.safety_score,
        flagged_ingredients: analysis.flagged_ingredients,
        safe_alternatives: analysis.safe_alternatives,
        mistral_analysis: analysis,
        is_in_routine: isInRoutine,
      })
      .select()
      .single()

    if (productError) {
      console.error('Product save error:', productError)
    }

    return NextResponse.json({
      success: true,
      product: product || null,
      analysis,
    })

  } catch (error) {
    console.error('Product analysis error:', error)
    return NextResponse.json(
      { error: 'Product analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
