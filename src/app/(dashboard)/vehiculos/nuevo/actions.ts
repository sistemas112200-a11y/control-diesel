'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { vehiculoSchema } from '@/lib/validation/vehiculo.schema'
import { crearVehiculo } from '@/repositories/vehiculo.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function crearVehiculoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'vehiculos', 'crear')) {
    throw new Error('No tienes permiso para crear vehículos')
  }

  const supabase = await createClient()

  const { data: terminal } = await supabase
    .from('usuario_terminales')
    .select('terminal_id')
    .eq('usuario_id', usuario.id)
    .limit(1)
    .maybeSingle()

  try {
    const input = vehiculoSchema.parse({
      empresa_id: usuario.empresaId,
      terminal_id: terminal?.terminal_id,
      numero_economico: formData.get('numero_economico'),
      placas: formData.get('placas') || undefined,
      marca: formData.get('marca') || undefined,
      modelo: formData.get('modelo') || undefined,
      anio: formData.get('anio') ? Number(formData.get('anio')) : undefined,
      capacidad_tanque1_litros: Number(formData.get('capacidad_tanque1_litros')),
      rendimiento_esperado_km_l: Number(formData.get('rendimiento_esperado_km_l')),
    })

    await crearVehiculo(supabase, input)
  } catch (error) {
    let mensaje = 'No se pudo guardar el vehículo, revisa los datos.'
    if (error instanceof z.ZodError) {
      mensaje = error.issues.map((e) => e.message).join(' / ')
    } else if (error instanceof Error) {
      mensaje = error.message
    }
    redirect(`/vehiculos/nuevo?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/vehiculos')
  redirect('/vehiculos')
}