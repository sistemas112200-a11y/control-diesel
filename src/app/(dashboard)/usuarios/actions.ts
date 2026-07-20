'use server'

import { revalidatePath } from 'next/cache'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { cambiarEstadoUsuario } from '@/repositories/usuario.repository'
import { createClient } from '@/lib/supabase/server'

export async function cambiarEstadoUsuarioAction(formData: FormData) {
  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puede(usuarioActual.rol, 'usuarios', 'editar')) {
    throw new Error('No tienes permiso para cambiar el estado de usuarios')
  }

  const id = formData.get('id') as string
  const nuevoEstado = formData.get('nuevo_estado') === 'true'

  const supabase = await createClient()
  await cambiarEstadoUsuario(supabase, id, nuevoEstado)

  revalidatePath('/usuarios')
}