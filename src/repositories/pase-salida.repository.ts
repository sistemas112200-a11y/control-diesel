import type { SupabaseClient } from '@supabase/supabase-js'
import type { PaseSalida } from '@/lib/supabase/types'

export async function getPasesSalida(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('pases_salida')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (PaseSalida & { vehiculos: { numero_economico: string } | null })[]
}

export async function getPaseSalidaById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('pases_salida')
    .select('*, vehiculos(numero_economico)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PaseSalida & { vehiculos: { numero_economico: string } | null }
}

export async function crearPaseSalida(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  destino: string | null
  firma1_nombre: string | null
  firma1_url: string | null
  firma2_nombre: string | null
  firma2_url: string | null
  firma3_nombre: string | null
  firma3_url: string | null
  created_by: string
}) {
  const { data, error } = await supabase
    .from('pases_salida')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as PaseSalida
}