import { createClient } from '@/lib/supabase/server'
import type { RolUsuario } from '@/lib/supabase/types'

export interface UsuarioActual {
  id: string
  email: string
  nombreCompleto: string
  rol: RolUsuario
  empresaId: string
}

export async function getUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nombre_completo, rol, empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return null

  return {
    id: user.id,
    email: user.email ?? '',
    nombreCompleto: perfil.nombre_completo,
    rol: perfil.rol,
    empresaId: perfil.empresa_id,
  }
}