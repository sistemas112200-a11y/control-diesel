'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { registrarCarga } from '@/domain/services/carga.service'
import { getUsuarioActual } from '@/lib/auth/session'

async function subirFoto(supabase: any, archivo: FormDataEntryValue | null, prefijo: string) {
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) return undefined
  const nombre = `${prefijo}-${Date.now()}-${archivo.name}`
  const { data, error } = await supabase.storage.from('cargas-foto').upload(nombre, archivo)
  if (error) throw error
  const { data: urlData } = supabase.storage.from('cargas-foto').getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function crearCargaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')

  const supabase = await createClient()

  const [fotoTicket, fotoKm, fotoBomba, fotoTanque1, fotoTanque2] = await Promise.all([
    subirFoto(supabase, formData.get('foto_ticket'), 'ticket'),
    subirFoto(supabase, formData.get('foto_kilometraje'), 'km'),
    subirFoto(supabase, formData.get('foto_bomba'), 'bomba'),
    subirFoto(supabase, formData.get('foto_tanque1'), 'tanque1'),
    subirFoto(supabase, formData.get('foto_tanque2'), 'tanque2'),
  ])

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
    folio_ticket: (formData.get('folio_ticket') as string) || undefined,
    foto_ticket_url: fotoTicket!,
    foto_kilometraje_url: fotoKm!,
    foto_bomba_url: fotoBomba!,
    foto_tanque1_url: fotoTanque1!,
    foto_tanque2_url: fotoTanque2,
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