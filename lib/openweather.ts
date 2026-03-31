const OPENWEATHER_BASE = 'https://api.openweathermap.org'

export interface OpenWeatherData {
  uv_index: number
  pm25: number
  humidity: number
  temperature: number
  description: string
  city: string
  icon: string
}

export async function getWeatherAndAirQuality(lat: number, lon: number): Promise<OpenWeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY!

  // Fetch current weather
  const weatherResponse = await fetch(
    `${OPENWEATHER_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`
  )
  if (!weatherResponse.ok) throw new Error('OpenWeather current weather failed')
  const weatherData = await weatherResponse.json()

  // Fetch UV index + air quality
  const uvResponse = await fetch(
    `${OPENWEATHER_BASE}/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
  )
  const aqiResponse = await fetch(
    `${OPENWEATHER_BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
  )

  const uvData = uvResponse.ok ? await uvResponse.json() : { value: 0 }
  const aqiData = aqiResponse.ok ? await aqiResponse.json() : { list: [{ components: { pm2_5: 0 } }] }

  const pm25 = aqiData.list?.[0]?.components?.pm2_5 ?? 0
  const city = weatherData.name || 'Votre ville'

  return {
    uv_index: uvData.value ?? 0,
    pm25,
    humidity: weatherData.main?.humidity ?? 50,
    temperature: weatherData.main?.temp ?? 20,
    description: weatherData.weather?.[0]?.description ?? 'conditions inconnues',
    city,
    icon: weatherData.weather?.[0]?.icon ?? '01d',
  }
}

export function getUVCategory(uv: number): { label: string; color: string; advice: string } {
  if (uv <= 2) return { label: 'Faible', color: '#22c55e', advice: 'SPF 15 suffisant' }
  if (uv <= 5) return { label: 'Modéré', color: '#eab308', advice: 'SPF 30 recommandé' }
  if (uv <= 7) return { label: 'Élevé', color: '#f97316', advice: 'SPF 50+ obligatoire' }
  if (uv <= 10) return { label: 'Très élevé', color: '#ef4444', advice: 'SPF 50+ + protection' }
  return { label: 'Extrême', color: '#9333ea', advice: 'Éviter l\'exposition directe' }
}

export function getAQICategory(pm25: number): { label: string; color: string; advice: string } {
  if (pm25 <= 12) return { label: 'Bon', color: '#22c55e', advice: 'Air pur, pas de protection nécessaire' }
  if (pm25 <= 35) return { label: 'Modéré', color: '#eab308', advice: 'Antioxydants recommandés' }
  if (pm25 <= 55) return { label: 'Mauvais', color: '#f97316', advice: 'Bouclier antioxydant essentiel' }
  return { label: 'Dangereux', color: '#ef4444', advice: 'Double nettoyage + Vit C/E impératif' }
}
