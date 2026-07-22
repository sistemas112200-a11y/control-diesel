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
    throw new Error('No tienes permiso para crear reportes')
  }

  try {
    const vehiculoId = formData.get('vehiculo_id') as string
    if (!vehiculoId) {
      throw new Error('Selecciona una unidad')
    }

    const operadorId = formData.get('operador_id') as string
    if (!operadorId) {
      throw new Error('Selecciona el operador que reporta')
    }

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
      operador_id: operadorId,
      created_by: usuario.id,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el reporte.'
    redirect(`/reportes-unidad/nuevo?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/reportes-unidad')
  redirect('/reportes-unidad')
}