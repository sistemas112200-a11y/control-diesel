import type { SupabaseClient } from '@supabase/supabase-js'
import type { Mecanico } from '@/lib/supabase/types'

export async function getMecanicos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('mecanicos')
    .select('*')
    .is('deleted_at', null)
    .order('nombre_completo', { ascending: true })

  if (error) throw error
  return data as Mecanico[]
}

export async function getMecanicosActivos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('mecanicos')
    .select('*')
    .is('deleted_at', null)
    .eq('activo', true)
    .order('nombre_completo', { ascending: true })

  if (error) throw error
  return data as Mecanico[]
}

export async function getMecanicoById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('mecanicos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Mecanico
}

export async function crearMecanico(supabase: SupabaseClient, input: {
  empresa_id: string
  nombre_completo: string
  telefono: string | null
  especialidad: string | null
}) {
  const { data, error } = await supabase
    .from('mecanicos')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Mecanico
}

export async function actualizarMecanico(supabase: SupabaseClient, id: string, input: {
  nombre_completo: string
  telefono: string | null
  especialidad: string | null
  activo: boolean
}) {
  const { error } = await supabase
    .from('mecanicos')
    .update(input)
    .eq('id', id)

  if (error) throw error
}