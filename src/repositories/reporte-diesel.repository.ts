import type { SupabaseClient } from '@supabase/supabase-js'

export interface ResumenDieselMes {
  mes: string
  litros: number
  gasto: number
}

export interface ResumenDieselUnidad {
  vehiculoId: string
  unidad: string
  litros: number
  gasto: number
  rendimientoPromedio: number | null
}

export interface ResumenDieselOperador {
  operadorId: string
  operador: string
  cargas: number
  rendimientoPromedio: number | null
}

export interface ResumenDiesel {
  litrosTotal: number
  gastoTotal: number
  rendimientoPromedio: number | null
  porMes: ResumenDieselMes[]
  porUnidad: ResumenDieselUnidad[]
  porOperador: ResumenDieselOperador[]
  mejoresUnidades: ResumenDieselUnidad[]
  mejoresOperadores: ResumenDieselOperador[]
}

interface AcumUnidad {
  unidad: string
  litros: number
  gasto: number
  rendimientos: number[]
}

interface AcumOperador {
  operador: string
  cargas: number
  rendimientos: number[]
}

export async function getResumenDiesel(
  supabase: SupabaseClient,
  opciones: { meses?: number; terminalId?: string } = {}
): Promise<ResumenDiesel> {
  const meses = opciones.meses ?? 6
  const desde = new Date()
  desde.setMonth(desde.getMonth() - (meses - 1))
  desde.setDate(1)
  desde.setHours(0, 0, 0, 0)

  let query = supabase
    .from('cargas_combustible')
    .select('vehiculo_id, operador_id, fecha_hora, litros_cargados, total_pagado, rendimiento_km_l, vehiculos(numero_economico), operadores(nombre_completo)')
    .is('deleted_at', null)
    .gte('fecha_hora', desde.toISOString())

  if (opciones.terminalId) query = query.eq('terminal_id', opciones.terminalId)

  const { data, error } = await query
  if (error) throw error

  const filas = (data ?? []) as any[]

  let litrosTotal = 0
  let gastoTotal = 0
  const rendimientos: number[] = []

  const porMesMap = new Map<string, { litros: number; gasto: number }>()
  const porUnidadMap = new Map<string, AcumUnidad>()
  const porOperadorMap = new Map<string, AcumOperador>()

  for (const fila of filas) {
    const litros = Number(fila.litros_cargados) || 0
    const gasto = Number(fila.total_pagado) || 0
    const rendimiento: number | null = fila.rendimiento_km_l != null ? Number(fila.rendimiento_km_l) : null

    litrosTotal += litros
    gastoTotal += gasto
    if (rendimiento != null) rendimientos.push(rendimiento)

    const mesKey = String(fila.fecha_hora).slice(0, 7)
    const mesActual = porMesMap.get(mesKey) ?? { litros: 0, gasto: 0 }
    mesActual.litros += litros
    mesActual.gasto += gasto
    porMesMap.set(mesKey, mesActual)

    const unidadNombre = fila.vehiculos?.numero_economico ?? 'Sin unidad'
    const unidadDefault: AcumUnidad = { unidad: unidadNombre, litros: 0, gasto: 0, rendimientos: [] }
    const unidadActual = porUnidadMap.get(fila.vehiculo_id) ?? unidadDefault
    unidadActual.litros += litros
    unidadActual.gasto += gasto
    if (rendimiento != null) unidadActual.rendimientos.push(rendimiento)
    porUnidadMap.set(fila.vehiculo_id, unidadActual)

    if (fila.operador_id) {
      const operadorNombre = fila.operadores?.nombre_completo ?? 'Sin operador'
      const operadorDefault: AcumOperador = { operador: operadorNombre, cargas: 0, rendimientos: [] }
      const operadorActual = porOperadorMap.get(fila.operador_id) ?? operadorDefault
      operadorActual.cargas += 1
      if (rendimiento != null) operadorActual.rendimientos.push(rendimiento)
      porOperadorMap.set(fila.operador_id, operadorActual)
    }
  }

  function promedio(nums: number[]): number | null {
    if (nums.length === 0) return null
    return nums.reduce((a, b) => a + b, 0) / nums.length
  }

  const porMes: ResumenDieselMes[] = Array.from(porMesMap.entries())
    .map(([mes, v]) => ({ mes, litros: v.litros, gasto: v.gasto }))
    .sort((a, b) => a.mes.localeCompare(b.mes))

  const porUnidad: ResumenDieselUnidad[] = Array.from(porUnidadMap.entries())
    .map(([vehiculoId, v]) => ({
      vehiculoId,
      unidad: v.unidad,
      litros: v.litros,
      gasto: v.gasto,
      rendimientoPromedio: promedio(v.rendimientos),
    }))
    // Se ocultan las unidades sin rendimiento calculado o con rendimiento 0
    .filter((u) => u.rendimientoPromedio != null && u.rendimientoPromedio > 0)
    .sort((a, b) => b.litros - a.litros)

  const porOperador: ResumenDieselOperador[] = Array.from(porOperadorMap.entries())
    .map(([operadorId, v]) => ({
      operadorId,
      operador: v.operador,
      cargas: v.cargas,
      rendimientoPromedio: promedio(v.rendimientos),
    }))
    // Se ocultan los operadores sin rendimiento calculado o con rendimiento 0
    .filter((o) => o.rendimientoPromedio != null && o.rendimientoPromedio > 0)
    .sort((a, b) => b.cargas - a.cargas)

  const mejoresUnidades = [...porUnidad]
    .sort((a, b) => (b.rendimientoPromedio ?? 0) - (a.rendimientoPromedio ?? 0))
    .slice(0, 5)

  const mejoresOperadores = [...porOperador]
    .sort((a, b) => (b.rendimientoPromedio ?? 0) - (a.rendimientoPromedio ?? 0))
    .slice(0, 5)

  return {
    litrosTotal,
    gastoTotal,
    rendimientoPromedio: promedio(rendimientos),
    porMes,
    porUnidad,
    porOperador,
    mejoresUnidades,
    mejoresOperadores,
  }
}