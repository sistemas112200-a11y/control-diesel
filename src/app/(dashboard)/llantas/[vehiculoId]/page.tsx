'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actualizarVehiculo } from '@/repositories/vehiculo.repository'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { galonesALitros, mpgAKmL } from '@/lib/unidades'

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

    const supabase = await createClient()
    const empresa = await getEmpresaById(supabase, usuario.empresaId)
    const unidad = empresa.unidad_medida

    const capacidadIngresada = Number(formData.get('capacidad_tanque1_litros'))
    if (!capacidadIngresada || capacidadIngresada <= 0) {
      throw new Error('La capacidad del tanque debe ser mayor a cero')
    }
    const capacidad = unidad === 'imperial' ? galonesALitros(capacidadIngresada) : capacidadIngresada

    const rendimientoIngresado = Number(formData.get('rendimiento_esperado_km_l'))
    if (!rendimientoIngresado || rendimientoIngresado <= 0) {
      throw new Error('El rendimiento esperado debe ser mayor a cero')
    }
    const rendimiento = unidad === 'imperial' ? mpgAKmL(rendimientoIngresado) : rendimientoIngresado

    const numeroLlantas = Number(formData.get('numero_llantas'))
    if (!numeroLlantas || numeroLlantas <= 0) {
      throw new Error('El número de llantas debe ser mayor a cero')
    }
    const tieneEjeDelantero = formData.get('tiene_eje_delantero') === 'on'

    const intervaloRaw = formData.get('intervalo_mantenimiento_km')
    const intervalo = intervaloRaw ? Number(intervaloRaw) : null
    if (intervalo != null && intervalo <= 0) {
      throw new Error('El intervalo de mantenimiento debe ser mayor a cero')
    }

    await actualizarVehiculo(supabase, id, {
      numero_economico: formData.get('numero_economico') as string,
      placas: (formData.get('placas') as string) || undefined,
      marca: (formData.get('marca') as string) || undefined,
      modelo: (formData.get('modelo') as string) || undefined,
      anio,
      capacidad_tanque1_litros: capacidad,
      rendimiento_esperado_km_l: rendimiento,
      numero_llantas: numeroLlantas,
      tiene_eje_delantero: tieneEjeDelantero,
    })

    const { error } = await supabase
      .from('vehiculos')
      .update({ intervalo_mantenimiento_km: intervalo })
      .eq('id', id)
    if (error) throw error
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el vehículo, revisa los datos.'
    redirect(`/vehiculos/${id}/editar?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/vehiculos')
  redirect('/vehiculos?ok=vehiculo')
}