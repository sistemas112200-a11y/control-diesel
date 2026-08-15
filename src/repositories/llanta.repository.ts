import type { SupabaseClient } from '@supabase/supabase-js'

export type PosicionLlanta = string

export type EstadoLlanta = 'en_uso' | 'almacen' | 'baja'

export interface Llanta {
  id: string
  vehiculo_id: string | null
  posicion: PosicionLlanta | null
  numero_serie: string | null
  marca: string
  modelo: string | null
  medida: string | null
  proveedor_id: string | null
  costo: number | null
  fecha_compra: string | null
  fecha_instalacion: string | null
  km_instalacion: number | null
  profundidad_original_mm: number
  profundidad_minima_mm: number
  presion_recomendada_psi: number | null
  estado: EstadoLlanta
  fecha_baja: string | null
  km_baja: number | null
  motivo_baja: string | null
  profundidad_actual_mm: number | null
  presion_actual_psi: number | null
  km_ultima_medicion: number | null
  fecha_ultima_medicion: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LlantaConVehiculo extends Llanta {
  vehiculos: { numero_economico: string } | null
}

export interface LlantaSemaforo extends Llanta {
  vehiculos: {
    numero_economico: string
    km_actual: number | null
    numero_llantas: number
    tiene_eje_delantero: boolean
  } | null
}

export interface NuevaLlantaInput {
  vehiculo_id?: string | null
  posicion?: PosicionLlanta | null
  numero_serie?: string | null
  marca: string
  modelo?: string | null
  medida?: string | null
  proveedor_id?: string | null
  costo?: number | null
  fecha_compra?: string | null
  fecha_instalacion?: string | null
  km_instalacion?: number | null
  profundidad_original_mm?: number
  profundidad_minima_mm?: number
  presion_recomendada_psi?: number | null
  created_by?: string | null
}

export async function getLlantas(
  supabase: SupabaseClient,
  opciones: { estado?: EstadoLlanta; vehiculoId?: string } = {}
) {
  let query = supabase
    .from('llantas')
    .select('*, vehiculos(numero_economico)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (opciones.estado) query = query.eq('estado', opciones.estado)
  if (opciones.vehiculoId) query = query.eq('vehiculo_id', opciones.vehiculoId)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as LlantaConVehiculo[]
}

export async function getLlantaById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('llantas')
    .select('*, vehiculos(numero_economico)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as unknown as LlantaConVehiculo
}

export async function getLlantasSemaforo(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('llantas')
    .select('*, vehiculos(numero_economico, km_actual, numero_llantas, tiene_eje_delantero)')
    .eq('estado', 'en_uso')
    .is('deleted_at', null)

  if (error) throw error
  return data as unknown as LlantaSemaforo[]
}

export async function crearLlanta(supabase: SupabaseClient, input: NuevaLlantaInput) {
  const { data, error } = await supabase
    .from('llantas')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Llanta
}

export async function actualizarLlanta(supabase: SupabaseClient, id: string, cambios: Partial<NuevaLlantaInput>) {
  const { data, error } = await supabase
    .from('llantas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Llanta
}

export async function darDeBajaLlanta(
  supabase: SupabaseClient,
  id: string,
  datos: { fecha_baja: string; km_baja: number; motivo_baja: string }
) {
  const { error } = await supabase
    .from('llantas')
    .update({ estado: 'baja' as EstadoLlanta, ...datos })
    .eq('id', id)

  if (error) throw error
}

export async function eliminarLlanta(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('llantas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}