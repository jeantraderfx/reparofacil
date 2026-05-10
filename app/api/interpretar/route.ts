import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { descripcion } = await req.json()
    if (!descripcion) return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Analiza esta descripción de un cliente que necesita un servicio del hogar en España y extrae la información clave.

Descripción: "${descripcion}"

Responde ÚNICAMENTE con un JSON con este formato exacto (sin markdown, sin explicaciones):
{
  "categoria": "una de estas: Electricidad, Fontanería, Pintura, Carpintería, Climatización, Limpieza, Reformas, Cerrajería, Jardinería, Mudanzas, General",
  "urgencia": "urgente o flexible",
  "resumen": "resumen conciso en máximo 2 frases de lo que necesita el cliente"
}`
        }]
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Error API')

    const text = data.content[0].text.trim()
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error al interpretar' }, { status: 500 })
  }
}
