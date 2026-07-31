'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { actualizarProducto } from '@/repositories/producto.repository'

export async function actualizarProductoAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const nombre = formData.get('nombre') as string
  const descripcion = (formData.get('descripcion') as string) || null
  const unidad_medida = (formData.get('unidad_medida') as string) || 'pieza'
  const existencia = Number(formData.get('existencia')) || 0
  const stockMinimoRaw = formData.get('stock_minimo') as string
  const stock_minimo = stockMinimoRaw ? Number(stockMinimoRaw) : null
  const activo = formData.get('activo') === 'on'

  await actualizarProducto(supabase, id, {
    nombre,
    descripcion,
    unidad_medida,
    existencia,
    stock_minimo,
    activo,
  })

  redirect('/almacen/productos')
}