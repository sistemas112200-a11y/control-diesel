'use server'

import { revalidatePath } from 'next/cache'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'

export async function cambiarEstadoVehiculoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'vehiculos', 'editar')) {
    throw new Error('No tienes permiso para cambiar el estado de vehículos')
  }

  const id = formData.get('id') as string
  const nuevoEstado = formData.get('nuevo_estado') as string

  const supabase = await createClient()
  const { error } = await supabase.from('vehiculos').update({ estado: nuevoEstado }).eq('id', id)
  if (error) throw error

  revalidatePath('/vehiculos')
}