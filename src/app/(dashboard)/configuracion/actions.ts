'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actualizarPermisoVista } from '@/repositories/permiso.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import type { RolUsuario } from '@/lib/supabase/types'
import type { ModuloVista } from '@/lib/auth/permissions'

export async function cambiarPermisoVistaAction(rol: RolUsuario, modulo: ModuloVista, puedeVer: boolean) {
  const usuario = await getUsuarioActual()
  if (!usuario || usuario.rol !== 'administrador') {
    throw new Error('Solo el administrador puede cambiar permisos')
  }

  const supabase = await createClient()
  await actualizarPermisoVista(supabase, rol, modulo, puedeVer)
  revalidatePath('/configuracion')
}