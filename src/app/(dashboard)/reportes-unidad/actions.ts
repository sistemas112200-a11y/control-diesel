'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cambiarEstadoOrden, cambiarPrioridadOrden } from '@/repositories/reporte.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import type { EstadoReporte, PrioridadOrden } from '@/lib/supabase/types'

export async function moverOrdenAction(id: string, nuevoEstado: EstadoReporte) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para mover órdenes de trabajo')
  }

  const supabase = await createClient()
  await cambiarEstadoOrden(supabase, id, nuevoEstado)
  revalidatePath('/reportes-unidad')
  revalidatePath(`/reportes-unidad/${id}`)
}

export async function cambiarPrioridadOrdenAction(id: string, prioridad: PrioridadOrden) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para cambiar la prioridad')
  }

  const supabase = await createClient()
  await cambiarPrioridadOrden(supabase, id, prioridad)
  revalidatePath('/reportes-unidad')
  revalidatePath(`/reportes-unidad/${id}`)
}