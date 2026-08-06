'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { registrarCarga } from '@/domain/services/carga.service'
import { getUsuarioActual } from '@/lib/auth/session'

export async function crearCargaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')

  const supabase = await createClient()

  const litros = Number(formData.get('litros_cargados'))
  const precio = Number(formData.get('precio_litro'))

  const input = {
    terminal_id: formData.get('terminal_id') as string,
    vehiculo_id: formData.get('vehiculo_id') as string,
    operador_id: formData.get('operador_id') as string,
    kilometraje: Number(formData.get('kilometraje')),
    litros_cargados: litros,
    precio_litro: precio,
    total_pagado: litros * precio,
    metodo_pago: formData.get('metodo_pago') as any,
    fecha_hora: (formData.get('fecha_hora') as string) || undefined,
    folio_ticket: (formData.get('folio_ticket') as string) || undefined,
    foto_ticket_url: (formData.get('foto_ticket_url') as string) || undefined,
    foto_kilometraje_url: (formData.get('foto_kilometraje_url') as string) || undefined,
    foto_bomba_url: (formData.get('foto_bomba_url') as string) || undefined,
    foto_tanque1_url: (formData.get('foto_tanque1_url') as string) || undefined,
    foto_tanque2_url: (formData.get('foto_tanque2_url') as string) || undefined,
    observaciones: (formData.get('observaciones') as string) || undefined,
  }

  const { alertasGeneradas } = await registrarCarga(supabase, input, usuario.id)

  revalidatePath('/cargas')
  revalidatePath('/dashboard')

  if (alertasGeneradas.length > 0) {
    redirect(`/cargas?alerta=${encodeURIComponent(alertasGeneradas[0].descripcion)}`)
  }

  redirect('/cargas')
}