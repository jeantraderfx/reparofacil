import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

    const { descripcion } = await req.json()
    if (!descripcion) return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Eres un clasificador de servicios del hogar. Analiza esta descripción y responde SOLO con JSON válido, sin markdown, sin backticks, sin explicaciones extra.

Descripción: "${descripcion}"

Formato de respuesta (solo esto, nada más):
{"categoria":"Fontanería","urgencia":"urgente","resumen":"El cliente necesita reparar un grifo roto que pierde agua."}`
        }],
        system: 'Eres un clasificador JSON. Solo respondes con JSON válido. Nunca uses markdown, backticks ni texto adicional. La categoría debe ser una de: Electricidad, Fontanería, Pintura, Carpintería, Climatización, Limpieza, Reformas, Cerrajería, Jardinería, Mudanzas, General. La urgencia es urgente o flexible.',
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(JSON.stringify(data.error))

    let text = data.content[0].text.trim()
    // Strip markdown if model still adds it
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error al interpretar' }, { status: 500 })
  }
}
