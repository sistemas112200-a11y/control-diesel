import type { SupabaseClient } from '@supabase/supabase-js'

export interface MedicionLlanta {
  id: string
  llanta_id: string
  fecha_hora: string
  km_vehiculo: number
  profundidad_interior_mm: number
  profundidad_centro_mm: number
  profundidad_exterior_mm: number
  presion_psi: number
  foto_url: string | null
  observaciones: string | null
  creado_por: string | null
  created_at: string
}

export interface NuevaMedicionInput {
  llanta_id: string
  fecha_hora?: string
  km_vehiculo: number
  profundidad_interior_mm: number
  profundidad_centro_mm: number
  profundidad_exterior_mm: number
  presion_psi: number
  foto_url?: string | null
  observaciones?: string | null
  creado_por?: string | null
}

export async function getMedicionesPorLlanta(supabase: SupabaseClient, llantaId: string) {
  const { data, error } = await supabase
    .from('mediciones_llanta')
    .select('*')
    .eq('llanta_id', llantaId)
    .order('fecha_hora', { ascending: false })

  if (error) throw error
  return data as MedicionLlanta[]
}

export async function crearMedicion(supabase: SupabaseClient, input: NuevaMedicionInput) {
  const { data, error } = await supabase
    .from('mediciones_llanta')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as MedicionLlanta
}