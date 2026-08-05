import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { getMecanicosActivos } from '@/repositories/mecanico.repository'
import { crearSalidaAction } from './actions'

export default async function NuevaSalidaPage() {
  const supabase = await createClient()
  const vehiculos = await getVehiculos(supabase)
  const mecanicos = await getMecanicosActivos(supabase)

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/almacen/salidas" className="text-sm text-slate-500 hover:text-slate-700">
        ← Salidas
      </Link>

      <h1 className="text-lg font-semibold text-slate-900">Nueva salida de almacén</h1>

      <form action={crearSalidaAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <select
            name="vehiculo_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Selecciona una unidad</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.numero_economico}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mecánico (opcional)</label>
          <select
            name="mecanico_id"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Sin asignar todavía</option>
            {mecanicos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/almacen/salidas"
            className="rounded-md border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Empezar a escanear
          </button>
        </div>
      </form>
    </div>
  )
}