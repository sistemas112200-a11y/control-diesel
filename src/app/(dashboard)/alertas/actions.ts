'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { cambiarEstadoAlerta } from '@/repositories/alerta.repository'
import type { EstadoAlerta } from '@/lib/supabase/types'

export async function cambiarEstadoAlertaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'alertas', 'editar')) {
    throw new Error('No tienes permiso para cambiar el estado de una alerta')
  }

  const id = formData.get('id') as string
  const estado = formData.get('estado') as EstadoAlerta

  const supabase = await createClient()
  await cambiarEstadoAlerta(supabase, id, estado, usuario.id)

  revalidatePath('/alertas')
  revalidatePath('/dashboard')
}