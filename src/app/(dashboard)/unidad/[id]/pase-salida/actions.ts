'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearPaseSalida } from '@/repositories/pase-salida.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'

function valorOVacio(v: FormDataEntryValue | null): string | null {
  if (!v) return null
  const texto = (v as string).trim()
  return texto === '' ? null : texto
}

export async function crearPaseSalidaAction(formData: FormData) {
  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'pases_salida', 'crear')) {
    throw new Error('No tienes permiso para generar pases de salida')
  }

  const vehiculoId = formData.get('vehiculo_id') as string
  const supabase = await createClient()

  const { data: terminalRow } = await supabase
    .from('usuario_terminales')
    .select('terminal_id')
    .eq('usuario_id', usuario.id)
    .limit(1)
    .maybeSingle()

  if (!terminalRow) {
    throw new Error('No se encontro una terminal asignada a tu usuario')
  }

  await crearPaseSalida(supabase, {
    terminal_id: terminalRow.terminal_id,
    vehiculo_id: vehiculoId,
    destino: valorOVacio(formData.get('destino')),
    firma1_nombre: valorOVacio(formData.get('firma1_nombre')),
    firma1_url: valorOVacio(formData.get('firma1_url')),
    firma2_nombre: valorOVacio(formData.get('firma2_nombre')),
    firma2_url: valorOVacio(formData.get('firma2_url')),
    firma3_nombre: valorOVacio(formData.get('firma3_nombre')),
    firma3_url: valorOVacio(formData.get('firma3_url')),
    created_by: usuario.id,
  })

  redirect('/unidad/' + vehiculoId + '?pase=1')
}