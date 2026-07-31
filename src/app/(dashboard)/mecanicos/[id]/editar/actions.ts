'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { actualizarMecanico } from '@/repositories/mecanico.repository'

export async function actualizarMecanicoAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const nombre_completo = formData.get('nombre_completo') as string
  const telefono = (formData.get('telefono') as string) || null
  const especialidad = (formData.get('especialidad') as string) || null
  const activo = formData.get('activo') === 'on'

  await actualizarMecanico(supabase, id, {
    nombre_completo,
    telefono,
    especialidad,
    activo,
  })

  redirect('/mecanicos?ok=1')
}