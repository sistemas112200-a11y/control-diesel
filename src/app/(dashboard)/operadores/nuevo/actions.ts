'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { operadorSchema } from '@/lib/validation/operador.schema'
import { crearOperador } from '@/repositories/operador.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function crearOperadorAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'operadores', 'crear')) {
    throw new Error('No tienes permiso para crear operadores')
  }

  const input = operadorSchema.parse({
    empresa_id: usuario.empresaId,
    nombre_completo: formData.get('nombre_completo'),
    licencia_numero: (formData.get('licencia_numero') as string) || undefined,
    licencia_vigencia: (formData.get('licencia_vigencia') as string) || undefined,
    telefono: (formData.get('telefono') as string) || undefined,
    direccion: (formData.get('direccion') as string) || undefined,
    fecha_ingreso: (formData.get('fecha_ingreso') as string) || undefined,
  })

  const supabase = await createClient()
  await crearOperador(supabase, input)

  revalidatePath('/operadores')
  redirect('/operadores')
}