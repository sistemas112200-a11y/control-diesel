import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCargaById } from '@/repositories/carga.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { FormularioEditarCarga } from './formulario-editar'

export default async function EditarCargaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puede(usuarioActual.rol, 'cargas', 'editar')) {
    redirect(`/cargas/${id}`)
  }

  const supabase = await createClient()

  let carga
  try {
    carga = await getCargaById(supabase, id)
  } catch {
    notFound()
  }

  const [{ data: vehiculos }, { data: operadores }] = await Promise.all([
    supabase.from('vehiculos').select('id, numero_economico').is('deleted_at', null).order('numero_economico'),
    supabase.from('operadores').select('id, nombre_completo').is('deleted_at', null).order('nombre_completo'),
  ])

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Editar carga</h1>
      <FormularioEditarCarga
        carga={carga}
        vehiculos={(vehiculos ?? []).map((v) => ({ value: v.id, label: v.numero_economico }))}
        operadores={(operadores ?? []).map((o) => ({ value: o.id, label: o.nombre_completo }))}
      />
    </div>
  )
}