import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { morning_products, evening_products, active_ingredients } = body

    if (!morning_products && !evening_products) {
      return NextResponse.json({ error: 'No routine provided' }, { status: 400 })
    }

    // Upsert the routine record for this user
    const { data, error } = await supabase
      .from('routines')
      .upsert({
        user_id: user.id,
        morning_products: morning_products || [],
        evening_products: evening_products || [],
        active_ingredients: active_ingredients || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Routine upsert error:', error)
      // continue but return partial info
    }

    // optionally mark any matching products as "is_in_routine"
    const allProducts = [...(morning_products || []), ...(evening_products || [])]
    if (allProducts.length > 0) {
      try {
        await supabase
          .from('products')
          .update({ is_in_routine: true })
          .in('name', allProducts)
      } catch (prodErr) {
        console.warn('Could not mark products in routine:', prodErr)
      }
    }

    return NextResponse.json({ success: true, routine: data })
  } catch (error) {
    console.error('Routine error:', error)
    return NextResponse.json(
      { error: 'Routine update failed' },
      { status: 500 }
    )
  }
}
