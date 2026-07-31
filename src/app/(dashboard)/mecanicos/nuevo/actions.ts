'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { crearMecanico } from '@/repositories/mecanico.repository'

export async function crearMecanicoAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()
  if (!perfil) redirect('/login')

  const nombre_completo = formData.get('nombre_completo') as string
  const telefono = (formData.get('telefono') as string) || null
  const especialidad = (formData.get('especialidad') as string) || null

  await crearMecanico(supabase, {
    empresa_id: perfil.empresa_id,
    nombre_completo,
    telefono,
    especialidad,
  })

  redirect('/mecanicos?ok=1')
}