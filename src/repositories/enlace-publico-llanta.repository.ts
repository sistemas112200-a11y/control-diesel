import type { SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export interface EnlacePublicoLlanta {
  id: string
  vehiculo_id: string
  token: string
  creado_por: string | null
  created_at: string
  firma_url: string | null
  firmado_por: string | null
  firmado_en: string | null
}

function generarToken() {
  return randomBytes(24).toString('hex')
}

export async function crearEnlacePublico(supabase: SupabaseClient, vehiculoId: string, creadoPor: string) {
  const token = generarToken()

  const { data, error } = await supabase
    .from('enlaces_publicos_llantas')
    .insert({ vehiculo_id: vehiculoId, token, creado_por: creadoPor })
    .select()
    .single()

  if (error) throw error
  return data as EnlacePublicoLlanta
}

export async function getEnlacePorToken(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase
    .from('enlaces_publicos_llantas')
    .select('*')
    .eq('token', token)
    .single()

  if (error) throw error
  return data as EnlacePublicoLlanta
}

export async function guardarFirmaEnlace(
  supabase: SupabaseClient,
  token: string,
  datos: { firma_url: string; firmado_por: string }
) {
  const { error } = await supabase
    .from('enlaces_publicos_llantas')
    .update({
      firma_url: datos.firma_url,
      firmado_por: datos.firmado_por,
      firmado_en: new Date().toISOString(),
    })
    .eq('token', token)

  if (error) throw error
}