'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { crearReporte } from '@/repositories/reporte.repository'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function crearReporteAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'crear')) {
    throw new Error('No tienes permiso para reportar problemas')
  }

  const vehiculoId = formData.get('vehiculo_id') as string

  try {
    const descripcion = (formData.get('descripcion') as string)?.trim()
    if (!descripcion) {
      throw new Error('Escribe una descripción del problema')
    }

    const supabase = await createClient()
    const vehiculo = await getVehiculoById(supabase, vehiculoId)

    await crearReporte(supabase, {
      terminal_id: vehiculo.terminal_id,
      vehiculo_id: vehiculoId,
      descripcion,
      created_by: usuario.id,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo enviar el reporte.'
    redirect(`/unidad/${vehiculoId}/reporte?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/reportes-unidad')
  redirect(`/unidad/${vehiculoId}/reporte?ok=1`)
}