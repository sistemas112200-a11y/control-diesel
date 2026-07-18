import type { SupabaseClient } from '@supabase/supabase-js'
import type { CargaCombustible } from '@/lib/supabase/types'
import type { CargaInput } from '@/lib/validation/carga.schema'

export async function getCargas(supabase: SupabaseClient, filtros: { vehiculoId?: string; terminalId?: string } = {}) {
  let query = supabase
    .from('cargas_combustible')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('fecha_hora', { ascending: false })

  if (filtros.vehiculoId) query = query.eq('vehiculo_id', filtros.vehiculoId)
  if (filtros.terminalId) query = query.eq('terminal_id', filtros.terminalId)

  const { data, error } = await query
  if (error) throw error
  return data as (CargaCombustible & { vehiculos: { numero_economico: string } | null })[]
}

export async function getCargaById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('cargas_combustible')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as CargaCombustible
}

export async function getUltimaCargaPorVehiculo(supabase: SupabaseClient, vehiculoId: string) {
  const { data, error } = await supabase
    .from('cargas_combustible')
    .select('*')
    .eq('vehiculo_id', vehiculoId)
    .is('deleted_at', null)
    .order('fecha_hora', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as CargaCombustible | null
}

export async function crearCarga(supabase: SupabaseClient, input: CargaInput & { created_by: string }) {
  // km_recorridos, rendimiento_km_l y costo_por_km los calcula el trigger de la Fase 3
  const { data, error } = await supabase
    .from('cargas_combustible')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as CargaCombustible
}

export async function eliminarCarga(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('cargas_combustible')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}