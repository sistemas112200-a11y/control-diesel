import type { SupabaseClient } from '@supabase/supabase-js'
import type { Aviso } from '@/lib/supabase/types'

export async function getAvisos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('avisos')
    .select('*, empresas(nombre)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Aviso & { empresas: { nombre: string } | null })[]
}

export async function getAvisosActivosParaEmpresa(supabase: SupabaseClient, empresaId: string) {
  const { data, error } = await supabase
    .from('avisos')
    .select('*')
    .or(`empresa_id.eq.${empresaId},empresa_id.is.null`)
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Aviso[]).filter((a) => !a.expira_at || new Date(a.expira_at) > new Date())
}

export async function crearAviso(supabase: SupabaseClient, input: {
  empresa_id: string | null
  mensaje: string
  tipo: string
  expira_at: string | null
  created_by: string
}) {
  const { data, error } = await supabase
    .from('avisos')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Aviso
}

export async function desactivarAviso(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('avisos')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}