'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { crearMedicion } from '@/repositories/medicion-llanta.repository'
import { darDeBajaLlanta } from '@/repositories/llanta.repository'
import { getUsuarioActual } from '@/lib/auth/session'

export async function registrarMedicionAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  const llantaId = formData.get('llanta_id') as string
  const vehiculoId = formData.get('vehiculo_id') as string

  const kmVehiculo = Number(formData.get('km_vehiculo'))
  const profundidadInterior = Number(formData.get('profundidad_interior_mm'))
  const profundidadCentro = Number(formData.get('profundidad_centro_mm'))
  const profundidadExterior = Number(formData.get('profundidad_exterior_mm'))
  const presionPsi = Number(formData.get('presion_psi'))
  const observaciones = (formData.get('observaciones') as string) || null

  const supabase = await createClient()
  await crearMedicion(supabase, {
    llanta_id: llantaId,
    km_vehiculo: kmVehiculo,
    profundidad_interior_mm: profundidadInterior,
    profundidad_centro_mm: profundidadCentro,
    profundidad_exterior_mm: profundidadExterior,
    presion_psi: presionPsi,
    observaciones,
    creado_por: usuario?.id ?? null,
  })

  revalidatePath(`/llantas/${vehiculoId}/${llantaId}`)
  revalidatePath(`/llantas/${vehiculoId}`)
}

export async function darDeBajaLlantaAction(formData: FormData) {
  const llantaId = formData.get('llanta_id') as string
  const vehiculoId = formData.get('vehiculo_id') as string
  const kmBaja = Number(formData.get('km_baja'))
  const motivoBaja = formData.get('motivo_baja') as string

  const supabase = await createClient()
  await darDeBajaLlanta(supabase, llantaId, {
    fecha_baja: new Date().toISOString(),
    km_baja: kmBaja,
    motivo_baja: motivoBaja,
  })

  revalidatePath(`/llantas/${vehiculoId}/${llantaId}`)
  revalidatePath(`/llantas/${vehiculoId}`)
}