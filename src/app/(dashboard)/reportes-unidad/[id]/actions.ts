'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { tomarReporte, resolverReporte, crearRefaccion, getReporteById } from '@/repositories/reporte.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function tomarReporteAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para tomar reportes')
  }

  const id = formData.get('id') as string
  const supabase = await createClient()
  await tomarReporte(supabase, id, usuario.id)

  revalidatePath(`/reportes-unidad/${id}`)
  revalidatePath('/reportes-unidad')
}

export async function resolverReporteAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para resolver reportes')
  }

  const id = formData.get('id') as string

  try {
    const posibleFalla = (formData.get('posible_falla') as string)?.trim()
    if (!posibleFalla) {
      throw new Error('Escribe la posible falla')
    }

    const solucion = (formData.get('solucion') as string)?.trim()
    if (!solucion) {
      throw new Error('Escribe qué se le hizo a la unidad')
    }

    const firmaUrl = formData.get('firma_url') as string
    if (!firmaUrl) {
      throw new Error('Falta la firma del mecánico')
    }

    const supabase = await createClient()
    await resolverReporte(supabase, id, { posible_falla: posibleFalla, solucion, firma_url: firmaUrl })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la solución.'
    redirect(`/reportes-unidad/${id}?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath(`/reportes-unidad/${id}`)
  revalidatePath('/reportes-unidad')
  redirect(`/reportes-unidad/${id}`)
}

export async function agregarRefaccionAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para agregar refacciones')
  }

  const id = formData.get('reporte_id') as string

  try {
    const descripcion = (formData.get('descripcion') as string)?.trim()
    if (!descripcion) {
      throw new Error('Escribe el nombre de la refacción')
    }

    const cantidad = Number(formData.get('cantidad'))
    if (!cantidad || cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero')
    }

    const costo = Number(formData.get('costo'))
    if (Number.isNaN(costo) || costo < 0) {
      throw new Error('El costo no es válido')
    }

    const supabase = await createClient()
    const reporte = await getReporteById(supabase, id)

    await crearRefaccion(supabase, {
      reporte_id: id,
      terminal_id: reporte.terminal_id,
      descripcion,
      cantidad,
      costo,
      created_by: usuario.id,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo agregar la refacción.'
    redirect(`/reportes-unidad/${id}?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath(`/reportes-unidad/${id}`)
}