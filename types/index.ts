export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  age: number | null
  skin_type: SkinType | null
  skin_concerns: string[]
  avatar_url: string | null
  whatsapp_number: string | null
  whatsapp_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ScanAnalysis {
  pore_dilation: number        // 1-10
  inflammation_zones: string[] // e.g. ['forehead', 'chin']
  hydration_level: number      // 1-10
  acne_severity: number        // 1-10
  redness_areas: string[]
  skin_texture: string
  overall_health: number       // 1-10
}

export interface Scan {
  id: string
  user_id: string
  image_url: string | null
  gemini_analysis: ScanAnalysis | null
  mistral_synthesis: string | null
  audio_url: string | null
  pore_score: number | null
  inflammation_score: number | null
  hydration_score: number | null
  overall_score: number | null
  created_at: string
}

export interface ProductIngredient {
  name: string
  safety: 'safe' | 'caution' | 'harmful'
  concern?: string
}

export interface SafeAlternative {
  name: string
  brand: string
  reason: string
  price_range: string
}

export interface ProductAnalysis {
  safety_score: number
  flagged_ingredients: ProductIngredient[]
  safe_alternatives: SafeAlternative[]
  conflict_warning?: string
  summary: string
}

export interface Product {
  id: string
  user_id: string
  name: string | null
  brand: string | null
  barcode: string | null
  inci_list: string | null
  safety_score: number | null
  flagged_ingredients: ProductIngredient[]
  safe_alternatives: SafeAlternative[]
  mistral_analysis: ProductAnalysis | null
  is_in_routine: boolean
  added_at: string
}

export interface Routine {
  id: string
  user_id: string
  morning_products: Product[]
  evening_products: Product[]
  active_ingredients: string[]
  updated_at: string
}

export interface WeatherData {
  uv_index: number
  pm25: number
  humidity: number
  temperature: number
  weather_description: string
  city: string
}

export interface RoutineAdjustment {
  type: 'add' | 'remove' | 'boost'
  ingredient: string
  reason: string
  urgency: 'low' | 'medium' | 'high'
  product_category: string
}

export interface ClimateLog {
  id: string
  user_id: string
  latitude: number | null
  longitude: number | null
  city: string | null
  uv_index: number | null
  pm25: number | null
  humidity: number | null
  temperature: number | null
  weather_description: string | null
  routine_adjustments: RoutineAdjustment[]
  logged_at: string
}

export interface ProgressReport {
  id: string
  user_id: string
  start_scan_id: string | null
  end_scan_id: string | null
  pore_improvement: number | null
  inflammation_improvement: number | null
  hydration_improvement: number | null
  overall_improvement: number | null
  gemini_comparison: string | null
  motivational_message: string | null
  created_at: string
}
