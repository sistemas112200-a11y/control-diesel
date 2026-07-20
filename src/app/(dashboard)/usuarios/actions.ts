'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { cambiarEstadoUsuario, cambiarRolUsuario } from '@/repositories/usuario.repository'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RolUsuario } from '@/lib/supabase/types'

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

export async function cambiarRolUsuarioAction(formData: FormData) {
  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puede(usuarioActual.rol, 'usuarios', 'editar')) {
    throw new Error('No tienes permiso para cambiar el rol de usuarios')
  }

  const id = formData.get('id') as string
  const rol = formData.get('rol') as RolUsuario

  const supabase = await createClient()
  await cambiarRolUsuario(supabase, id, rol)

  revalidatePath('/usuarios')
  redirect('/usuarios?ok=rol')
}

export async function restablecerContrasenaAction(formData: FormData) {
  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puede(usuarioActual.rol, 'usuarios', 'editar')) {
    throw new Error('No tienes permiso para restablecer contraseñas')
  }

  const id = formData.get('id') as string
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    redirect(`/usuarios/${id}/editar?error=${encodeURIComponent('La contraseña debe tener al menos 6 caracteres')}`)
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) {
    redirect(`/usuarios/${id}/editar?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/usuarios?ok=password')
}