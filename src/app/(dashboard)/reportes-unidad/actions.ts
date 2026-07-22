'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { marcarReporteResuelto } from '@/repositories/reporte.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

export async function marcarResueltoAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'reportes_unidad', 'editar')) {
    throw new Error('No tienes permiso para marcar reportes como resueltos')
  }

  const id = formData.get('id') as string
  const supabase = await createClient()
  await marcarReporteResuelto(supabase, id)

  revalidatePath('/reportes-unidad')
}