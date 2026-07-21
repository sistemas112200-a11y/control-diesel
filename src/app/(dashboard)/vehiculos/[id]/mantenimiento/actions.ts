'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { crearMantenimiento } from '@/repositories/mantenimiento.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function crearMantenimientoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'vehiculos', 'editar')) {
    throw new Error('No tienes permiso para registrar mantenimientos')
  }

  const vehiculoId = formData.get('vehiculo_id') as string

  try {
    const kilometraje = Number(formData.get('kilometraje'))
    if (!kilometraje || kilometraje <= 0) {
      throw new Error('El kilometraje debe ser mayor a cero')
    }

    const descripcion = (formData.get('descripcion') as string)?.trim()
    if (!descripcion) {
      throw new Error('Escribe una descripción del mantenimiento')
    }

    const supabase = await createClient()
    await crearMantenimiento(supabase, {
      terminal_id: formData.get('terminal_id') as string,
      vehiculo_id: vehiculoId,
      tipo: formData.get('tipo') as 'preventivo' | 'correctivo',
      descripcion,
      kilometraje,
      fecha: formData.get('fecha') as string,
      created_by: usuario.id,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el mantenimiento.'
    redirect(`/vehiculos/${vehiculoId}/mantenimiento?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath(`/vehiculos/${vehiculoId}/mantenimiento`)
  redirect(`/vehiculos/${vehiculoId}/mantenimiento`)
}