import type { SupabaseClient } from '@supabase/supabase-js'
import type { RolUsuario } from '@/lib/supabase/types'
import type { ModuloVista } from '@/lib/auth/permissions'

const TODOS_LOS_MODULOS: ModuloVista[] = [
  'dashboard', 'vehiculos', 'operadores', 'cargas', 'alertas',
  'reportes', 'usuarios', 'configuracion', 'mantenimientos', 'reportes_unidad',
]

export async function getModulosVisibles(supabase: SupabaseClient, rol: RolUsuario): Promise<Set<ModuloVista>> {
  if (rol === 'administrador') {
    return new Set(TODOS_LOS_MODULOS)
  }

  const { data, error } = await supabase
    .from('permisos_vista')
    .select('modulo, puede_ver')
    .eq('rol', rol)
    .eq('puede_ver', true)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.modulo as ModuloVista))
}

export async function getMatrizPermisos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('permisos_vista')
    .select('rol, modulo, puede_ver')
    .order('modulo')

  if (error) throw error
  return data as { rol: RolUsuario; modulo: ModuloVista; puede_ver: boolean }[]
}

export async function actualizarPermisoVista(supabase: SupabaseClient, rol: RolUsuario, modulo: ModuloVista, puedeVer: boolean) {
  const { error } = await supabase
    .from('permisos_vista')
    .update({ puede_ver: puedeVer })
    .eq('rol', rol)
    .eq('modulo', modulo)

  if (error) throw error
}