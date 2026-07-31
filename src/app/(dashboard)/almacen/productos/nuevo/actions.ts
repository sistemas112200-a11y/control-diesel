'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearProducto } from '@/repositories/producto.repository'

export async function crearProductoAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()
  if (!perfil) redirect('/login')

  const nombre = formData.get('nombre') as string
  const descripcion = (formData.get('descripcion') as string) || null
  const unidad_medida = (formData.get('unidad_medida') as string) || 'pieza'
  const existencia = Number(formData.get('existencia')) || 0
  const stockMinimoRaw = formData.get('stock_minimo') as string
  const stock_minimo = stockMinimoRaw ? Number(stockMinimoRaw) : null

  const producto = await crearProducto(supabase, {
    empresa_id: perfil.empresa_id,
    nombre,
    descripcion,
    unidad_medida,
    existencia,
    stock_minimo,
  })

  redirect(`/almacen/productos/${producto.id}/codigo?nuevo=1`)
}