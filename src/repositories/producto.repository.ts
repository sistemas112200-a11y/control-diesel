import type { SupabaseClient } from '@supabase/supabase-js'
import type { Producto } from '@/lib/supabase/types'

export async function getProductos(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .is('deleted_at', null)
    .order('nombre', { ascending: true })

  if (error) throw error
  return data as Producto[]
}

export async function getProductoById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Producto
}

export async function getProductoByCodigo(supabase: SupabaseClient, codigo: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo', codigo.trim())
    .is('deleted_at', null)
    .maybeSingle()

  if (error) throw error
  return data as Producto | null
}

export async function crearProducto(supabase: SupabaseClient, input: {
  empresa_id: string
  nombre: string
  descripcion: string | null
  unidad_medida: string
  existencia: number
  stock_minimo: number | null
}) {
  const { data, error } = await supabase
    .from('productos')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Producto
}

export async function actualizarProducto(supabase: SupabaseClient, id: string, input: {
  nombre: string
  descripcion: string | null
  unidad_medida: string
  existencia: number
  stock_minimo: number | null
  activo: boolean
}) {
  const { error } = await supabase
    .from('productos')
    .update(input)
    .eq('id', id)

  if (error) throw error
}