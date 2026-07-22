import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReporteUnidad } from '@/lib/supabase/types'

export async function getReportes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('reportes_unidad')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (ReporteUnidad & { vehiculos: { numero_economico: string } | null })[]
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

export async function marcarReporteResuelto(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('reportes_unidad')
    .update({ estado: 'resuelto' })
    .eq('id', id)

  if (error) throw error
}