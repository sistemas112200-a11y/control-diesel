import type { SupabaseClient } from '@supabase/supabase-js'
import type { SalidaAlmacen, SalidaDetalle } from '@/lib/supabase/types'

export async function getSalidas(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('salidas_almacen')
    .select('*, vehiculos(numero_economico), mecanicos(nombre_completo)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (SalidaAlmacen & {
    vehiculos: { numero_economico: string } | null
    mecanicos: { nombre_completo: string } | null
  })[]
}

export async function getSalidaById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('salidas_almacen')
    .select('*, vehiculos(numero_economico), mecanicos(nombre_completo)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as SalidaAlmacen & {
    vehiculos: { numero_economico: string } | null
    mecanicos: { nombre_completo: string } | null
  }
}

export async function crearSalida(supabase: SupabaseClient, input: {
  terminal_id: string
  vehiculo_id: string
  mecanico_id: string | null
  created_by: string
}) {
  const { data, error } = await supabase
    .from('salidas_almacen')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as SalidaAlmacen
}

export async function getDetalleSalida(supabase: SupabaseClient, salidaId: string) {
  const { data, error } = await supabase
    .from('salida_detalle')
    .select('*, productos(codigo, nombre, unidad_medida)')
    .eq('salida_id', salidaId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as (SalidaDetalle & {
    productos: { codigo: string; nombre: string; unidad_medida: string } | null
  })[]
}

export async function agregarProductoPorCodigo(
  supabase: SupabaseClient,
  salidaId: string,
  codigo: string,
  cantidad: number = 1
) {
  const { data: salida, error: errorSalida } = await supabase
    .from('salidas_almacen')
    .select('id, estado')
    .eq('id', salidaId)
    .single()

  if (errorSalida) throw errorSalida
  if (salida.estado !== 'abierta') {
    throw new Error('Esta salida ya está cerrada.')
  }

  const { data: producto, error: errorProducto } = await supabase
    .from('productos')
    .select('id, nombre, activo, existencia, unidad_medida')
    .eq('codigo', codigo.trim())
    .is('deleted_at', null)
    .maybeSingle()

  if (errorProducto) throw errorProducto
  if (!producto) {
    throw new Error(`No se encontró ningún producto con el código "${codigo}".`)
  }
  if (!producto.activo) {
    throw new Error(`El producto "${producto.nombre}" está inactivo.`)
  }
  if (producto.existencia < cantidad) {
    throw new Error(`No hay suficiente existencia de "${producto.nombre}" (quedan ${producto.existencia}).`)
  }

  const { error: errorInsert } = await supabase
    .from('salida_detalle')
    .insert({ salida_id: salidaId, producto_id: producto.id, cantidad })

  if (errorInsert) throw errorInsert

  return producto
}

export async function quitarProductoDeSalida(supabase: SupabaseClient, detalleId: string) {
  const { error } = await supabase
    .from('salida_detalle')
    .delete()
    .eq('id', detalleId)

  if (error) throw error
}

export async function cerrarSalida(supabase: SupabaseClient, id: string, input: {
  mecanico_id: string
  firma_url: string
}) {
  const { data: salida, error: errorSalida } = await supabase
    .from('salidas_almacen')
    .select('id, estado')
    .eq('id', id)
    .single()

  if (errorSalida) throw errorSalida
  if (salida.estado !== 'abierta') {
    throw new Error('Esta salida ya está cerrada.')
  }

  const { error } = await supabase
    .from('salidas_almacen')
    .update({
      estado: 'cerrada',
      mecanico_id: input.mecanico_id,
      firma_url: input.firma_url,
      cerrada_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}