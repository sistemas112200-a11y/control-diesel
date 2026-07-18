import type { SupabaseClient } from '@supabase/supabase-js'
import type { Vehiculo } from '@/lib/supabase/types'
import type { VehiculoInput } from '@/lib/validation/vehiculo.schema'

export async function getVehiculos(supabase: SupabaseClient, terminalId?: string, busqueda?: string) {
  let query = supabase
    .from('vehiculos')
    .select('*')
    .is('deleted_at', null)
    .order('numero_economico')

  if (terminalId) query = query.eq('terminal_id', terminalId)
  if (busqueda) query = query.or(`numero_economico.ilike.%${busqueda}%,placas.ilike.%${busqueda}%,marca.ilike.%${busqueda}%`)

  const { data, error } = await query
  if (error) throw error
  return data as Vehiculo[]
}

export async function getVehiculoById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('vehiculos')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Vehiculo
}

export async function crearVehiculo(supabase: SupabaseClient, input: VehiculoInput) {
  const { data, error } = await supabase
    .from('vehiculos')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Vehiculo
}

export async function actualizarVehiculo(supabase: SupabaseClient, id: string, input: Partial<VehiculoInput>) {
  const { data, error } = await supabase
    .from('vehiculos')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Vehiculo
}

export async function eliminarVehiculo(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('vehiculos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}   