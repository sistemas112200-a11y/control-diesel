'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actualizarVehiculo } from '@/repositories/vehiculo.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function actualizarVehiculoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'vehiculos', 'editar')) {
    throw new Error('No tienes permiso para editar vehículos')
  }

  const id = formData.get('id') as string

  try {
    const anioRaw = formData.get('anio')
    const anio = anioRaw ? Number(anioRaw) : undefined
    if (anio != null && (anio < 1980 || anio > new Date().getFullYear() + 1)) {
      throw new Error('El año no parece válido')
    }

    const capacidad = Number(formData.get('capacidad_tanque1_litros'))
    if (!capacidad || capacidad <= 0) {
      throw new Error('La capacidad del tanque debe ser mayor a cero')
    }

    const rendimiento = Number(formData.get('rendimiento_esperado_km_l'))
    if (!rendimiento || rendimiento <= 0) {
      throw new Error('El rendimiento esperado debe ser mayor a cero')
    }

    const supabase = await createClient()
    await actualizarVehiculo(supabase, id, {
      numero_economico: formData.get('numero_economico') as string,
      placas: (formData.get('placas') as string) || undefined,
      marca: (formData.get('marca') as string) || undefined,
      modelo: (formData.get('modelo') as string) || undefined,
      anio,
      capacidad_tanque1_litros: capacidad,
      rendimiento_esperado_km_l: rendimiento,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el vehículo, revisa los datos.'
    redirect(`/vehiculos/${id}/editar?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/vehiculos')
  redirect('/vehiculos?ok=vehiculo')
}