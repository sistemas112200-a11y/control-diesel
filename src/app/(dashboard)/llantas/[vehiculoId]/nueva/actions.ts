'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearLlanta, type PosicionLlanta } from '@/repositories/llanta.repository'
import { getUsuarioActual } from '@/lib/auth/session'

export async function crearLlantaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  const vehiculoId = formData.get('vehiculo_id') as string
  const marca = formData.get('marca') as string

  if (!marca) throw new Error('La marca es obligatoria.')

  const modelo = (formData.get('modelo') as string) || null
  const medida = (formData.get('medida') as string) || null
  const numeroSerie = (formData.get('numero_serie') as string) || null
  const posicion = (formData.get('posicion') as string) || null
  const fechaInstalacion = (formData.get('fecha_instalacion') as string) || null
  const kmInstalacion = formData.get('km_instalacion') ? Number(formData.get('km_instalacion')) : null
  const profundidadOriginal = formData.get('profundidad_original_mm') ? Number(formData.get('profundidad_original_mm')) : 18
  const profundidadMinima = formData.get('profundidad_minima_mm') ? Number(formData.get('profundidad_minima_mm')) : 3
  const presionRecomendada = formData.get('presion_recomendada_psi') ? Number(formData.get('presion_recomendada_psi')) : null
  const costo = formData.get('costo') ? Number(formData.get('costo')) : null

  const supabase = await createClient()
  await crearLlanta(supabase, {
    vehiculo_id: vehiculoId,
    marca,
    modelo,
    medida,
    numero_serie: numeroSerie,
    posicion: (posicion as PosicionLlanta) || null,
    fecha_instalacion: fechaInstalacion,
    km_instalacion: kmInstalacion,
    profundidad_original_mm: profundidadOriginal,
    profundidad_minima_mm: profundidadMinima,
    presion_recomendada_psi: presionRecomendada,
    costo,
    created_by: usuario?.id ?? null,
  })

  revalidatePath(`/llantas/${vehiculoId}`)
  redirect(`/llantas/${vehiculoId}`)
}