'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function crearUsuarioAction(formData: FormData) {
  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puede(usuarioActual.rol, 'usuarios', 'crear')) {
    throw new Error('No tienes permiso para crear usuarios')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombreCompleto = formData.get('nombre_completo') as string
  const rol = formData.get('rol') as string
  const terminalId = formData.get('terminal_id') as string

  const admin = createAdminClient()

  const { data: nuevoAuthUser, error: errorAuth } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (errorAuth) throw errorAuth

  const { error: errorPerfil } = await admin.from('usuarios').insert({
    id: nuevoAuthUser.user.id,
    nombre_completo: nombreCompleto,
    rol,
    empresa_id: usuarioActual.empresaId,
    email,
  })
  if (errorPerfil) throw errorPerfil

  if (terminalId) {
    await admin.from('usuario_terminales').insert({
      usuario_id: nuevoAuthUser.user.id,
      terminal_id: terminalId,
    })
  }

  revalidatePath('/usuarios')
  redirect('/usuarios')
}