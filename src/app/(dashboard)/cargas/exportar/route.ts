import { createClient } from '@/lib/supabase/server'
import { getCargas } from '@/repositories/carga.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { formatoDistancia, formatoVolumen, formatoRendimiento } from '@/lib/unidades'

function formatoFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString('es-MX', {
    timeZone: 'America/Chihuahua',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function celdaCSV(valor: string | number) {
  const texto = String(valor)
  if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
    return `"${texto.replace(/"/g, '""')}"`
  }
  return texto
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? undefined
  const desde = searchParams.get('desde') ?? undefined
  const hasta = searchParams.get('hasta') ?? undefined

  const supabase = await createClient()
  const usuarioActual = await getUsuarioActual()

  if (!usuarioActual) {
    return new Response('No autorizado', { status: 401 })
  }

  const empresa = await getEmpresaById(supabase, usuarioActual.empresaId)
  const unidad = empresa.unidad_medida

  const todasLasCargas = await getCargas(supabase)

  let cargas = todasLasCargas
  if (q) {
    const termino = q.toLowerCase()
    cargas = cargas.filter((c) => {
      const unidadVehiculo = (c as any).vehiculos?.numero_economico ?? ''
      const folio = c.folio_ticket ?? ''
      return unidadVehiculo.toLowerCase().includes(termino) || folio.toLowerCase().includes(termino)
    })
  }
  if (desde) {
    const desdeMs = new Date(`${desde}T00:00:00`).getTime()
    cargas = cargas.filter((c) => new Date(c.fecha_hora).getTime() >= desdeMs)
  }
  if (hasta) {
    const hastaMs = new Date(`${hasta}T23:59:59.999`).getTime()
    cargas = cargas.filter((c) => new Date(c.fecha_hora).getTime() <= hastaMs)
  }

  const etiquetaDistancia = unidad === 'imperial' ? 'Millaje' : 'Kilometraje'
  const etiquetaVolumen = unidad === 'imperial' ? 'Galones' : 'Litros'

  const encabezados = [
    'Unidad',
    'Fecha y hora',
    'Folio',
    etiquetaDistancia,
    etiquetaVolumen,
    'Total pagado',
    'Rendimiento',
  ]

  const filas = cargas.map((c) => {
    const unidadVehiculo = (c as any).vehiculos?.numero_economico ?? ''
    return [
      unidadVehiculo,
      formatoFechaHora(c.fecha_hora),
      c.folio_ticket ?? '',
      formatoDistancia(c.kilometraje, unidad, 0),
      formatoVolumen(c.litros_cargados, unidad, 2),
      c.total_pagado.toFixed(2),
      c.rendimiento_km_l ? formatoRendimiento(c.rendimiento_km_l, unidad) : '—',
    ]
  })

  const lineas = [encabezados, ...filas].map((fila) => fila.map(celdaCSV).join(','))
  const csv = '\uFEFF' + lineas.join('\r\n')

  const nombreArchivo = `cargas_${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
    },
  })
}