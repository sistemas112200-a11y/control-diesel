import { createClient } from '@/lib/supabase/server'
import { getVehiculos, getVehiculoById } from '@/repositories/vehiculo.repository'
import { FormularioNuevaCarga } from './formulario'

export default async function NuevaCargaPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculo_id?: string }>
}) {
  const { vehiculo_id } = await searchParams
  const supabase = await createClient()

  if (vehiculo_id) {
    let vehiculoEscaneado = null
    try {
      vehiculoEscaneado = await getVehiculoById(supabase, vehiculo_id)
    } catch {
      vehiculoEscaneado = null
    }

    if (vehiculoEscaneado && vehiculoEscaneado.estado !== 'activo') {
      return (
        <div className="max-w-md mx-auto text-center space-y-4 py-16">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-red-600">UNIDAD DESACTIVADA</h1>
          <p className="text-lg text-slate-700">
            La unidad <span className="font-semibold">{vehiculoEscaneado.numero_economico}</span> no está activa en este momento.
          </p>
          <p className="text-slate-600">Contacta al personal a cargo antes de continuar.</p>
        </div>
      )
    }
  }

  const todosLosVehiculos = await getVehiculos(supabase)
  const vehiculos = todosLosVehiculos.filter((v) => v.estado === 'activo')

  const { data: operadores } = await supabase
    .from('operadores')
    .select('id, nombre_completo')
    .is('deleted_at', null)
    .eq('activo', true)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: terminal } = await supabase
    .from('usuario_terminales')
    .select('terminal_id')
    .eq('usuario_id', user!.id)
    .limit(1)
    .maybeSingle()

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nueva carga de combustible</h1>

      <FormularioNuevaCarga
        terminalId={terminal?.terminal_id ?? ''}
        vehiculoIdPreseleccionado={vehiculo_id}
        vehiculos={vehiculos.map((v) => ({ value: v.id, label: v.numero_economico }))}
        operadores={(operadores ?? []).map((o) => ({ value: o.id, label: o.nombre_completo }))}
      />
    </div>
  )
}