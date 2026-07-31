'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actualizarMantenimiento } from '@/repositories/mantenimiento.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function actualizarMantenimientoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'vehiculos', 'editar')) {
    throw new Error('No tienes permiso para editar mantenimientos')
  }

  const id = formData.get('id') as string

  try {
    const kilometraje = Number(formData.get('kilometraje'))
    if (!kilometraje || kilometraje <= 0) {
      throw new Error('El kilometraje debe ser mayor a cero')
    }

    const descripcion = (formData.get('descripcion') as string)?.trim()
    if (!descripcion) {
      throw new Error('Escribe una descripción del mantenimiento')
    }

    const intervaloKmRaw = formData.get('intervalo_km') as string
    const intervaloDiasRaw = formData.get('intervalo_dias') as string
    const intervalo_km = intervaloKmRaw ? Number(intervaloKmRaw) : null
    const intervalo_dias = intervaloDiasRaw ? Number(intervaloDiasRaw) : null

    if (!intervalo_km && !intervalo_dias) {
      throw new Error('Indica cada cuántos km o cada cuántos días le toca este mantenimiento')
    }

    const avisoKmRaw = formData.get('aviso_km') as string
    const avisoDiasRaw = formData.get('aviso_dias') as string
    const aviso_km = avisoKmRaw ? Number(avisoKmRaw) : null
    const aviso_dias = avisoDiasRaw ? Number(avisoDiasRaw) : null

    const supabase = await createClient()
    await actualizarMantenimiento(supabase, id, {
      tipo: formData.get('tipo') as 'preventivo' | 'correctivo',
      descripcion,
      kilometraje,
      intervalo_km,
      intervalo_dias,
      aviso_km,
      aviso_dias,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el mantenimiento.'
    redirect(`/mantenimientos/${id}/editar?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/mantenimientos')
  redirect('/mantenimientos?ok=1')
}