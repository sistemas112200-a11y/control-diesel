'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { cambiarEstadoOperador } from '@/repositories/operador.repository'

export async function cambiarEstadoOperadorAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'operadores', 'editar')) {
    throw new Error('No tienes permiso para cambiar el estado de operadores')
  }

  const id = formData.get('id') as string
  const nuevoEstado = formData.get('nuevo_estado') === 'true'

  const supabase = await createClient()
  await cambiarEstadoOperador(supabase, id, nuevoEstado)

  revalidatePath('/operadores')
}