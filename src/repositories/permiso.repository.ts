import type { SupabaseClient } from '@supabase/supabase-js'
import type { RolUsuario } from '@/lib/supabase/types'
import type { ModuloVista } from '@/lib/auth/permissions'

const TODOS_LOS_MODULOS: ModuloVista[] = [
  'dashboard', 'vehiculos', 'operadores', 'cargas', 'alertas',
  'reportes', 'usuarios', 'configuracion', 'mantenimientos', 'reportes_unidad', 'pases_salida',
]

export async function getModulosVisibles(supabase: SupabaseClient, rol: RolUsuario, empresaId: string): Promise<Set<ModuloVista>> {
  let base: Set<ModuloVista>

  if (rol === 'administrador') {
    base = new Set(TODOS_LOS_MODULOS)
  } else {
    const { data, error } = await supabase
      .from('permisos_vista')
      .select('modulo, puede_ver')
      .eq('rol', rol)
      .eq('puede_ver', true)

    if (error) throw error
    base = new Set((data ?? []).map((row) => row.modulo as ModuloVista))
  }

  const { data: desactivados, error: errorDesactivados } = await supabase
    .from('modulos_empresa')
    .select('modulo')
    .eq('empresa_id', empresaId)
    .eq('activo', false)

  if (errorDesactivados) throw errorDesactivados

  const bloqueados = new Set((desactivados ?? []).map((m) => m.modulo as ModuloVista))
  return new Set([...base].filter((m) => !bloqueados.has(m)))
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

export async function getModulosEmpresa(supabase: SupabaseClient, empresaId: string) {
  const { data, error } = await supabase
    .from('modulos_empresa')
    .select('modulo, activo')
    .eq('empresa_id', empresaId)

  if (error) throw error
  return data as { modulo: ModuloVista; activo: boolean }[]
}

export async function actualizarModuloEmpresa(supabase: SupabaseClient, empresaId: string, modulo: ModuloVista, activo: boolean) {
  const { error } = await supabase
    .from('modulos_empresa')
    .upsert({ empresa_id: empresaId, modulo, activo })

  if (error) throw error
}