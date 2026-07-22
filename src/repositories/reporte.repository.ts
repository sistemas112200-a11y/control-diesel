import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReporteUnidad, RefaccionReporte } from '@/lib/supabase/types'

export async function getReportes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (ReporteUnidad & { vehiculos: { numero_economico: string } | null })[]
}

export async function getReporteById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .select('*, vehiculos(numero_economico)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ReporteUnidad & { vehiculos: { numero_economico: string } | null }
}

export async function crearReporte(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  descripcion: string
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

export async function tomarReporte(supabase: SupabaseClient, id: string, usuarioId: string) {
  const { error } = await supabase
    .from('reportes_unidad')
    .update({ estado: 'en_proceso', tomado_por: usuarioId })
    .eq('id', id)

  if (error) throw error
}

export async function resolverReporte(supabase: SupabaseClient, id: string, solucion: string) {
  const { error } = await supabase
    .from('reportes_unidad')
    .update({ estado: 'resuelto', solucion, fecha_solucion: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
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