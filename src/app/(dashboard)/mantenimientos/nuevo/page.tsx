import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { BuscadorUnidad } from '@/components/ui/buscador-unidad'
import { crearMantenimientoAction } from './actions'

export default async function NuevoMantenimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const todosLosVehiculos = await getVehiculos(supabase)
  const vehiculos = todosLosVehiculos.filter((v) => v.estado === 'activo')

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo mantenimiento</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <form action={crearMantenimientoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <BuscadorUnidad
            name="vehiculo_id"
            opciones={vehiculos.map((v) => ({ id: v.id, label: v.numero_economico }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select name="tipo" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometraje</label>
            <input
              name="kilometraje"
              type="number"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input
            name="fecha"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            required
            placeholder="Ej. Cambio de aceite y filtros"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors">
          Guardar mantenimiento
        </button>
      </form>
    </div>
  )
}