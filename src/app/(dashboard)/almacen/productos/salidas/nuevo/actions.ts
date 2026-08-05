'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearSalida } from '@/repositories/almacen.repository'
import { getVehiculoById } from '@/repositories/vehiculo.repository'

export async function crearSalidaAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const vehiculo_id = formData.get('vehiculo_id') as string
  const mecanicoIdRaw = formData.get('mecanico_id') as string
  const mecanico_id = mecanicoIdRaw ? mecanicoIdRaw : null

  const vehiculo = await getVehiculoById(supabase, vehiculo_id)

  const salida = await crearSalida(supabase, {
    terminal_id: vehiculo.terminal_id,
    vehiculo_id,
    mecanico_id,
    created_by: user.id,
  })

  redirect(`/almacen/salidas/${salida.id}`)
}