import type { SupabaseClient } from '@supabase/supabase-js'
import type { Empresa } from '@/lib/supabase/types'

export async function getEmpresas(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data as Empresa[]
}

export async function getEmpresaById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Empresa
}

export async function crearEmpresa(supabase: SupabaseClient, input: { nombre: string; rfc: string | null }) {
  const { data, error } = await supabase
    .from('empresas')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Empresa
}

export async function actualizarLimitesEmpresa(supabase: SupabaseClient, id: string, input: { limite_usuarios: number | null; limite_vehiculos: number | null }) {
  const { error } = await supabase
    .from('empresas')
    .update(input)
    .eq('id', id)

  if (error) throw error
}

export async function getUsoEmpresa(supabase: SupabaseClient, empresaId: string) {
  const [{ count: usuarios }, { count: vehiculos }] = await Promise.all([
    supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    supabase.from('vehiculos').select('id', { count: 'exact', head: true }).eq('empresa_id', empresaId).is('deleted_at', null),
  ])

  return { usuarios: usuarios ?? 0, vehiculos: vehiculos ?? 0 }
}