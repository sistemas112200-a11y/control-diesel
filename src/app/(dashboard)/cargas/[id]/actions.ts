'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actualizarCarga, eliminarCarga } from '@/repositories/carga.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function editarCargaAction(id: string, formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'cargas', 'editar')) {
    throw new Error('No tienes permiso para editar cargas')
  }

  const supabase = await createClient()

  const litros = Number(formData.get('litros_cargados'))
  const precio = Number(formData.get('precio_litro'))

  const input = {
    vehiculo_id: formData.get('vehiculo_id') as string,
    operador_id: formData.get('operador_id') as string,
    kilometraje: Number(formData.get('kilometraje')),
    litros_cargados: litros,
    precio_litro: precio,
    total_pagado: litros * precio,
    metodo_pago: formData.get('metodo_pago') as any,
    folio_ticket: (formData.get('folio_ticket') as string) || null,
    foto_ticket_url: formData.get('foto_ticket_url') as string,
    foto_kilometraje_url: formData.get('foto_kilometraje_url') as string,
    foto_bomba_url: formData.get('foto_bomba_url') as string,
    foto_tanque1_url: formData.get('foto_tanque1_url') as string,
    foto_tanque2_url: (formData.get('foto_tanque2_url') as string) || null,
    observaciones: (formData.get('observaciones') as string) || null,
  }

  await actualizarCarga(supabase, id, input as any)

  revalidatePath('/cargas')
  revalidatePath(`/cargas/${id}`)
  revalidatePath('/dashboard')

  redirect(`/cargas/${id}`)
}

export async function eliminarCargaAction(id: string) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'cargas', 'eliminar')) {
    throw new Error('No tienes permiso para eliminar cargas')
  }

  const supabase = await createClient()
  await eliminarCarga(supabase, id)

  revalidatePath('/cargas')
  revalidatePath('/dashboard')

  redirect('/cargas')
}