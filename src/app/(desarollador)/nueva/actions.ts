'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { crearEmpresa } from '@/repositories/empresa.repository'

export async function crearEmpresaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || usuario.rol !== 'desarrollador') {
    throw new Error('No tienes permiso para crear empresas')
  }

  const nombre = (formData.get('nombre') as string)?.trim()
  const rfc = (formData.get('rfc') as string)?.trim() || null
  const terminalNombre = (formData.get('terminal_nombre') as string)?.trim() || 'Matriz'

  if (!nombre) {
    throw new Error('El nombre de la empresa es obligatorio')
  }

  const supabase = await createClient()
  const empresa = await crearEmpresa(supabase, { nombre, rfc })

  const { error } = await supabase
    .from('terminales')
    .insert({ empresa_id: empresa.id, nombre: terminalNombre })

  if (error) throw error

  revalidatePath('/desarrollador')
  redirect('/desarrollador')
}