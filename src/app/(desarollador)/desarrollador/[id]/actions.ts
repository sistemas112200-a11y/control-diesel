'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { actualizarLimitesEmpresa } from '@/repositories/empresa.repository'
import { actualizarModuloEmpresa } from '@/repositories/permiso.repository'
import type { ModuloVista } from '@/lib/auth/permissions'

async function verificarDesarrollador() {
  const usuario = await getUsuarioActual()
  if (!usuario || usuario.rol !== 'desarrollador') {
    throw new Error('No tienes permiso para hacer esto')
  }
}

export async function actualizarLimitesAction(formData: FormData) {
  await verificarDesarrollador()

  const empresaId = formData.get('empresa_id') as string
  const limiteUsuariosRaw = (formData.get('limite_usuarios') as string)?.trim()
  const limiteVehiculosRaw = (formData.get('limite_vehiculos') as string)?.trim()

  const supabase = await createClient()
  await actualizarLimitesEmpresa(supabase, empresaId, {
    limite_usuarios: limiteUsuariosRaw ? Number(limiteUsuariosRaw) : null,
    limite_vehiculos: limiteVehiculosRaw ? Number(limiteVehiculosRaw) : null,
  })

  revalidatePath(`/desarrollador/${empresaId}`)
}

export async function actualizarModuloEmpresaAction(empresaId: string, modulo: ModuloVista, activo: boolean) {
  await verificarDesarrollador()

  const supabase = await createClient()
  await actualizarModuloEmpresa(supabase, empresaId, modulo, activo)

  revalidatePath(`/desarrollador/${empresaId}`)
}