import type { SupabaseClient } from '@supabase/supabase-js'
import type { Usuario, RolUsuario } from '@/lib/supabase/types'

export async function getUsuarios(supabase: SupabaseClient, empresaId: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nombre_completo')

  if (error) throw error
  return data as Usuario[]
}

export async function getUsuarioById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Usuario
}

export async function cambiarEstadoUsuario(supabase: SupabaseClient, id: string, activo: boolean) {
  const { error } = await supabase
    .from('usuarios')
    .update({ activo })
    .eq('id', id)

  if (error) throw error
}

export async function cambiarRolUsuario(supabase: SupabaseClient, id: string, rol: RolUsuario) {
  const { error } = await supabase
    .from('usuarios')
    .update({ rol })
    .eq('id', id)

  if (error) throw error
}