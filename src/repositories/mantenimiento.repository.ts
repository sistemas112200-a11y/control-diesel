import type { SupabaseClient } from '@supabase/supabase-js'
import type { Mantenimiento, TipoMantenimiento } from '@/lib/supabase/types'

export async function getMantenimientos(supabase: SupabaseClient, vehiculoId?: string) {
  let query = supabase
    .from('mantenimientos')
    .select('*, vehiculos(numero_economico, km_actual)')
    .is('deleted_at', null)
    .order('fecha', { ascending: false })

  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)

  const { data, error } = await query
  if (error) throw error
  return data as (Mantenimiento & { vehiculos: { numero_economico: string; km_actual: number } | null })[]
}

export async function getMantenimientosPorVehiculo(supabase: SupabaseClient, vehiculoId: string) {
  const { data, error } = await supabase
    .from('mantenimientos')
    .select('*')
    .eq('vehiculo_id', vehiculoId)
    .is('deleted_at', null)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data as Mantenimiento[]
}

export async function getMantenimientoById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('mantenimientos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Mantenimiento
}

export async function getMantenimientosVencidosYProximos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('mantenimientos')
    .select('*, vehiculos(numero_economico, km_actual)')
    .is('deleted_at', null)

  if (error) throw error
  return data as (Mantenimiento & { vehiculos: { numero_economico: string; km_actual: number } | null })[]
}

export async function crearMantenimiento(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  tipo: TipoMantenimiento
  descripcion: string
  kilometraje: number
  intervalo_km: number | null
  intervalo_dias: number | null
  aviso_km: number | null
  aviso_dias: number | null
  created_by: string
}) {
  const { data, error } = await supabase
    .from('mantenimientos')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Mantenimiento
}

export async function actualizarMantenimiento(supabase: SupabaseClient, id: string, input: {
  tipo: TipoMantenimiento
  descripcion: string
  kilometraje: number
  intervalo_km: number | null
  intervalo_dias: number | null
  aviso_km: number | null
  aviso_dias: number | null
}) {
  const { error } = await supabase
    .from('mantenimientos')
    .update(input)
    .eq('id', id)

  if (error) throw error
}