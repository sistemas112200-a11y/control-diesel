import type { SupabaseClient } from '@supabase/supabase-js'
import type { Mantenimiento, TipoMantenimiento } from '@/lib/supabase/types'

export async function getMantenimientos(supabase: SupabaseClient, vehiculoId?: string) {
  let query = supabase
    .from('mantenimientos')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('fecha', { ascending: false })

  if (vehiculoId) query = query.eq('vehiculo_id', vehiculoId)

  const { data, error } = await query
  if (error) throw error
  return data as (Mantenimiento & { vehiculos: { numero_economico: string } | null })[]
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

export async function crearMantenimiento(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  tipo: TipoMantenimiento
  descripcion: string
  kilometraje: number
  fecha: string
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