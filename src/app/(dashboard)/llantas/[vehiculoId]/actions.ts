'use server'

import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { crearEnlacePublico } from '@/repositories/enlace-publico-llanta.repository'

export async function generarEnlaceLlantasAction(vehiculoId: string): Promise<string> {
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')

  const supabase = await createClient()
  const enlace = await crearEnlacePublico(supabase, vehiculoId, usuario.id)
  return enlace.token
}