import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReporteUnidad, RefaccionReporte, EstadoReporte, PrioridadOrden } from '@/lib/supabase/types'

export async function getReportes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .select('*, vehiculos(numero_economico), operadores(nombre_completo)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (ReporteUnidad & {
    vehiculos: { numero_economico: string } | null
    operadores: { nombre_completo: string } | null
  })[]
}

export async function getReporteById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .select('*, vehiculos(numero_economico), operadores(nombre_completo)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ReporteUnidad & {
    vehiculos: { numero_economico: string } | null
    operadores: { nombre_completo: string } | null
  }
}

export async function crearReporte(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  descripcion: string
  operador_id: string | null
  created_by: string
}) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as ReporteUnidad
}

// Crea una orden automática a partir de un mantenimiento vencido.
// Si ya existe una orden sin completar para ese mantenimiento, no hace nada (evita duplicados).
export async function crearOrdenDesdeMantenimiento(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  mantenimiento_id: string
  descripcion: string
}) {
  const { data: existente } = await supabase
    .from('reportes_unidad')
    .select('id')
    .eq('mantenimiento_id', input.mantenimiento_id)
    .neq('estado', 'completada')
    .is('deleted_at', null)
    .maybeSingle()

  if (existente) return

  const { error } = await supabase.from('reportes_unidad').insert({
    terminal_id: input.terminal_id,
    vehiculo_id: input.vehiculo_id,
    mantenimiento_id: input.mantenimiento_id,
    descripcion: input.descripcion,
    estado: 'abierta',
    prioridad: 'alta',
  })

  // Si otro usuario la creó al mismo tiempo, el índice único la rechaza — lo ignoramos.
  if (error && error.code !== '23505') throw error
}

const TRANSICIONES_PERMITIDAS: Record<EstadoReporte, EstadoReporte[]> = {
  abierta: ['asignada'],
  asignada: ['en_proceso', 'abierta'],
  en_proceso: ['espera_refacciones', 'asignada'],
  espera_refacciones: ['en_proceso'],
  completada: [],
}

export function transicionesPermitidas(estado: EstadoReporte): EstadoReporte[] {
  return TRANSICIONES_PERMITIDAS[estado]
}

export async function tomarReporte(supabase: SupabaseClient, id: string, usuarioId: string) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .update({ estado: 'asignada', tomado_por: usuarioId })
    .eq('id', id)
    .select('vehiculo_id')
    .single()

  if (error) throw error

  const { error: errorVehiculo } = await supabase
    .from('vehiculos')
    .update({ estado: 'taller' })
    .eq('id', data.vehiculo_id)

  if (errorVehiculo) throw errorVehiculo
}

export async function cambiarEstadoOrden(supabase: SupabaseClient, id: string, nuevoEstado: EstadoReporte) {
  const { error } = await supabase
    .from('reportes_unidad')
    .update({ estado: nuevoEstado })
    .eq('id', id)

  if (error) throw error
}

export async function cambiarPrioridadOrden(supabase: SupabaseClient, id: string, prioridad: PrioridadOrden) {
  const { error } = await supabase
    .from('reportes_unidad')
    .update({ prioridad })
    .eq('id', id)

  if (error) throw error
}

export async function resolverReporte(supabase: SupabaseClient, id: string, input: {
  posible_falla: string
  solucion: string
  firma_url: string
}) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .update({
      estado: 'completada',
      posible_falla: input.posible_falla,
      solucion: input.solucion,
      firma_url: input.firma_url,
      fecha_solucion: new Date().toISOString(),
    })
    .eq('id', id)
    .select('vehiculo_id')
    .single()

  if (error) throw error

  const { error: errorVehiculo } = await supabase
    .from('vehiculos')
    .update({ estado: 'activo' })
    .eq('id', data.vehiculo_id)

  if (errorVehiculo) throw errorVehiculo
}

export async function getRefaccionesPorReporte(supabase: SupabaseClient, reporteId: string) {
  const { data, error } = await supabase
    .from('refacciones_reporte')
    .select('*')
    .eq('reporte_id', reporteId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as RefaccionReporte[]
}

export async function crearRefaccion(supabase: SupabaseClient, input: {
  reporte_id: string
  terminal_id: string
  descripcion: string
  cantidad: number
  costo: number
  created_by: string
}) {
  const { data, error } = await supabase
    .from('refacciones_reporte')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as RefaccionReporte
}