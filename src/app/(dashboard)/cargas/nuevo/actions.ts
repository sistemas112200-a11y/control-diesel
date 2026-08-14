'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { registrarCarga } from '@/domain/services/carga.service'
import { getUsuarioActual } from '@/lib/auth/session'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { millasAKm, galonesALitros, precioPorGalonAPorLitro } from '@/lib/unidades'

export async function crearCargaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario) throw new Error('No autenticado')

  const supabase = await createClient()
  const empresa = await getEmpresaById(supabase, usuario.empresaId)
  const unidad = empresa.unidad_medida

  const kilometrajeCapturado = Number(formData.get('kilometraje'))
  const litrosCapturados = Number(formData.get('litros_cargados'))
  const precioCapturado = Number(formData.get('precio_litro'))

  // El total pagado se calcula con los valores tal como los capturó el usuario (coincide con el ticket real)
  const totalPagado = litrosCapturados * precioCapturado

  const kilometraje = unidad === 'imperial' ? Math.round(millasAKm(kilometrajeCapturado)) : kilometrajeCapturado
  const litros = unidad === 'imperial' ? galonesALitros(litrosCapturados) : litrosCapturados
  const precio_litro = unidad === 'imperial' ? precioPorGalonAPorLitro(precioCapturado) : precioCapturado

  const input = {
    terminal_id: formData.get('terminal_id') as string,
    vehiculo_id: formData.get('vehiculo_id') as string,
    operador_id: formData.get('operador_id') as string,
    kilometraje,
    litros_cargados: litros,
    precio_litro,
    total_pagado: totalPagado,
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