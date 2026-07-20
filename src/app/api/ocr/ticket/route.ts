import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const archivo = formData.get('foto') as File | null

  if (!archivo) {
    return NextResponse.json({ error: 'Falta la imagen' }, { status: 400 })
  }

  const buffer = Buffer.from(await archivo.arrayBuffer())
  const base64 = buffer.toString('base64')

  const respuesta = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }),
    }
  )

  const datos = await respuesta.json()

  // DEBUG TEMPORAL: si Google mandó un error, lo regresamos tal cual para verlo en el navegador
  if (datos.error || datos.responses?.[0]?.error) {
    return NextResponse.json({
      errorGoogle: datos.error ?? datos.responses[0].error,
      httpStatus: respuesta.status,
    })
  }

  const texto: string = datos.responses?.[0]?.fullTextAnnotation?.text ?? ''

  const litros = texto.match(/(\d+[.,]?\d*)\s*(?:LTS?|LITROS?)/i)?.[1]?.replace(',', '.')
  const total = texto.match(/TOTAL[:\s$]*([\d,]+\.\d{2})/i)?.[1]?.replace(',', '')
  const folio = texto.match(/(?:FOLIO|TICKET|No\.?)[:\s]*(\w+)/i)?.[1]

  return NextResponse.json({ texto, litros, total, folio, httpStatus: respuesta.status })
}