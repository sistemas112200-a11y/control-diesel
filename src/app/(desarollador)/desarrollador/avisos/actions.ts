'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { crearAviso, desactivarAviso } from '@/repositories/aviso.repository'

async function verificarDesarrollador() {
  const usuario = await getUsuarioActual()
  if (!usuario || usuario.rol !== 'desarrollador') {
    throw new Error('No tienes permiso para hacer esto')
  }
  return usuario
}

export async function crearAvisoAction(formData: FormData) {
  const usuario = await verificarDesarrollador()

  const mensaje = (formData.get('mensaje') as string)?.trim()
  const empresaId = (formData.get('empresa_id') as string) || null
  const tipo = (formData.get('tipo') as string) || 'info'
  const expiraRaw = (formData.get('expira_at') as string) || null

  if (!mensaje) {
    throw new Error('El mensaje es obligatorio')
  }

  const supabase = await createClient()
  await crearAviso(supabase, {
    empresa_id: empresaId,
    mensaje,
    tipo,
    expira_at: expiraRaw ? new Date(expiraRaw).toISOString() : null,
    created_by: usuario.id,
  })

  revalidatePath('/desarrollador/avisos')
}

export async function desactivarAvisoAction(formData: FormData) {
  await verificarDesarrollador()

  const id = formData.get('id') as string
  const supabase = await createClient()
  await desactivarAviso(supabase, id)

  revalidatePath('/desarrollador/avisos')
}