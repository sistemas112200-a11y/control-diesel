import type { SupabaseClient } from '@supabase/supabase-js'
import type { Operador } from '@/lib/supabase/types'
import type { OperadorInput } from '@/lib/validation/operador.schema'

export async function getOperadores(supabase: SupabaseClient, busqueda?: string) {
  let query = supabase
    .from('operadores')
    .select('*')
    .is('deleted_at', null)
    .order('nombre_completo')

  if (busqueda) query = query.or(`nombre_completo.ilike.%${busqueda}%,licencia_numero.ilike.%${busqueda}%`)

  const { data, error } = await query
  if (error) throw error
  return data as Operador[]
}

export async function getOperadorById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('operadores')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as Operador
}

export async function crearOperador(supabase: SupabaseClient, input: OperadorInput) {
  const { data, error } = await supabase
    .from('operadores')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Operador
}

export async function cambiarEstadoOperador(supabase: SupabaseClient, id: string, activo: boolean) {
  const { error } = await supabase
    .from('operadores')
    .update({ activo })
    .eq('id', id)

  if (error) throw error
}