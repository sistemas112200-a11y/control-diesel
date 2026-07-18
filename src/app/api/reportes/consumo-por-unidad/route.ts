import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: cargas } = await supabase
    .from('cargas_combustible')
    .select('vehiculo_id, litros_cargados, total_pagado, rendimiento_km_l, vehiculos(numero_economico)')
    .is('deleted_at', null)

  const porVehiculo = new Map<string, { numero_economico: string; litros: number; gasto: number; cargas: number }>()

  for (const c of cargas ?? []) {
    const numeroEconomico = (c.vehiculos as any)?.numero_economico ?? '—'
    const fila = porVehiculo.get(c.vehiculo_id) ?? {
      numero_economico: numeroEconomico,
      litros: 0,
      gasto: 0,
      cargas: 0,
    }
    fila.litros += c.litros_cargados
    fila.gasto += c.total_pagado
    fila.cargas += 1
    porVehiculo.set(c.vehiculo_id, fila)
  }

  const encabezado = 'Unidad,Cargas,Litros totales,Gasto total\n'
  const filas = Array.from(porVehiculo.values())
    .map((f) => `${f.numero_economico},${f.cargas},${f.litros.toFixed(0)},${f.gasto.toFixed(2)}`)
    .join('\n')

  const csv = encabezado + filas

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="consumo-por-unidad.csv"',
    },
  })
}