const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

async function callMistral(messages: Array<{ role: string; content: string }>, temperature = 0.3) {
  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages,
      temperature,
      response_format: { type: 'text' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Mistral API error: ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content as string
}

export interface SkinSynthesisResult {
  personalized_advice: string
  priority_concern: string
  actionable_tips: string[]
  // optional routine recommendation with product names and key ingredients
  recommended_routine?: {
    morning: Array<{ product: string; active_ingredients: string[] }>
    evening: Array<{ product: string; active_ingredients: string[] }>
  }
}

export async function synthesizeSkinDiagnosis(
  geminiAnalysis: object,
  skinType: string,
  age: number
): Promise<SkinSynthesisResult> {
  const systemPrompt = `Tu es une coach beauté bienveillante et experte en dermatologie. 
Tu parles toujours en français, avec un ton chaleureux, rassurant et positif.
Tu donnes des conseils personnalisés, concrets et adaptés au profil de l'utilisatrice.`

  const userPrompt = `Voici l'analyse clinique de la peau d'une femme de ${age} ans avec peau ${skinType} :
${JSON.stringify(geminiAnalysis, null, 2)}

Synthétise ces données en un conseil audio personnalisé en JSON:
{
  "personalized_advice": "<2-3 phrases bienveillantes et chaleureuses pour un message audio, maximum 150 mots>",
  "priority_concern": "<la préoccupation principale en 5 mots max>",
  "actionable_tips": ["<conseil 1 très concret>", "<conseil 2>", "<conseil 3>"],
  "recommended_routine": {
    "morning": [
      {"product": "<nom produit matin>", "active_ingredients": ["<ingrédient1>", "<ingrédient2>"]}
    ],
    "evening": [
      {"product": "<nom produit soir>", "active_ingredients": ["<ingrédient1>", "<ingrédient2>"]}
    ]
  }
}`

  const response = await callMistral([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Mistral synthesis failed')
  return JSON.parse(jsonMatch[0]) as SkinSynthesisResult
}

export interface ProductAnalysisResult {
  safety_score: number
  flagged_ingredients: Array<{ name: string; safety: 'safe' | 'caution' | 'harmful'; concern?: string }>
  safe_alternatives: Array<{ name: string; brand: string; reason: string; price_range: string }>
  conflict_warning?: string
  summary: string
}

export async function analyzeProductIngredients(
  inciList: string,
  currentRoutineIngredients: string[],
  skinType: string,
  skinConcerns: string[],
  age?: number,
  morningProducts?: string[],
  eveningProducts?: string[]
): Promise<ProductAnalysisResult> {
  const systemPrompt = `Tu es un expert en cosmétologie et sécurité des ingrédients INCI. 
Tu analyses les produits cosmetiques avec rigueur scientifique et personnalisation complète.`

  const ageContext = age ? `âgée de ${age} ans` : ''
  const morningRoutine = morningProducts && morningProducts.length > 0
    ? morningProducts.map((p: any) => typeof p === 'string' ? p : p.name || JSON.stringify(p)).join(', ')
    : 'Aucun'
  const eveningRoutine = eveningProducts && eveningProducts.length > 0
    ? eveningProducts.map((p: any) => typeof p === 'string' ? p : p.name || JSON.stringify(p)).join(', ')
    : 'Aucun'

  const userPrompt = `Analyse cette liste INCI pour une femme ${ageContext} avec peau ${skinType} et préoccupations: ${skinConcerns.join(', ') || 'aucune'}.

${age && age >= 40 ? '⚠️ Profil 40+ : privilégie les ingrédients anti-âge (rétinol micro-dosé, peptides, acide hyaluronique haute PM). Sois vigilante sur les irritants.' : ''}
${age && age < 25 ? '⚠️ Profil jeune peau : surveille particulièrement les perturbateurs endocriniens et les occlusifs pouvant aggraver l acné juvénile.' : ''}

Liste INCI du produit:
${inciList}

Routine matinale actuelle (produits):
${morningRoutine}

Routine du soir actuelle (produits):
${eveningRoutine}

Ingrédients actifs actifs dans la routine:
${currentRoutineIngredients.join(', ') || 'Aucun'}

Retourne UNIQUEMENT un JSON valide:
{
  "safety_score": <integer 0-100>,
  "flagged_ingredients": [
    {"name": "...", "safety": "safe|caution|harmful", "concern": "raison si caution/harmful"}
  ],
  "safe_alternatives": [
    {"name": "nom du produit alternatif", "brand": "marque", "reason": "raison du choix adapté au profil âge/peau", "price_range": "€|€€|€€€"}
  ],
  "conflict_warning": "<texte d'avertissement si conflit avec la routine existante, null sinon>",
  "summary": "<résumé en 2 phrases incluant la compatibilité avec le profil de l utilisatrice>"
}

Signale obligatoirement: sulfates (SLS/SLES), parabènes, perturbateurs endocriniens, alcool dénaturé, conflits Rétinol+AHA/BHA.`

  const response = await callMistral([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ])

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Mistral product analysis failed')
  return JSON.parse(jsonMatch[0]) as ProductAnalysisResult
}

export interface ClimateRoutineResult {
  adjustments: Array<{
    type: 'add' | 'remove' | 'boost'
    ingredient: string
    reason: string
    urgency: 'low' | 'medium' | 'high'
    product_category: string
  }>
  summary_message: string
}

export async function generateClimateRoutine(
  weather: { uv_index: number; pm25: number; humidity: number; temperature: number; description: string },
  skinType: string
): Promise<ClimateRoutineResult> {
  const userPrompt = `Adapte la routine pour peau ${skinType} selon ces conditions météo:
- Indice UV: ${weather.uv_index}
- Pollution PM2.5: ${weather.pm25} µg/m³
- Humidité: ${weather.humidity}%
- Température: ${weather.temperature}°C
- Conditions: ${weather.description}

Retourne UNIQUEMENT un JSON valide:
{
  "adjustments": [
    {
      "type": "add|remove|boost",
      "ingredient": "nom ingrédient actif",
      "reason": "raison courte",
      "urgency": "low|medium|high",
      "product_category": "catégorie (ex: sérum, crème, SPF)"
    }
  ],
  "summary_message": "<1-2 phrases résumant les recommandations du jour>"
}

Règles: UV>6→SPF50+, PM2.5>25→antioxydants (Vit C/E), Humidité<40%→céramides, Humidité>70%→textures légères.`

  const response = await callMistral([
    { role: 'user', content: userPrompt },
  ])

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Mistral climate routine failed')
  return JSON.parse(jsonMatch[0]) as ClimateRoutineResult
}

export async function generateProgressMessage(
  improvements: { pore: number; inflammation: number; hydration: number; overall: number }
): Promise<string> {
  const response = await callMistral([
    {
      role: 'user',
      content: `Génère un message motivant (2 phrases max) pour une femme qui a ces améliorations de peau: 
pores: ${improvements.pore}%, inflammation: ${improvements.inflammation}%, hydratation: ${improvements.hydration}%, global: ${improvements.overall}%.
Ton chaleureux, encourageant, en français.`,
    },
  ], 0.7)
  return response
}
