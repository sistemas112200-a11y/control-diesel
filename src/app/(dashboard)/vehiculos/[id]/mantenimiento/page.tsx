import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getMantenimientosPorVehiculo } from '@/repositories/mantenimiento.repository'
import { crearMantenimientoAction } from './actions'

const TIPO_LABEL: Record<string, string> = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
}

export default async function MantenimientoVehiculoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)
  const mantenimientos = await getMantenimientosPorVehiculo(supabase, id)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Mantenimiento — {vehiculo.numero_economico}</h1>
        <p className="text-sm text-slate-500 mt-1">Kilometraje actual: {vehiculo.km_actual} km</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Registrar mantenimiento</h2>
        <form action={crearMantenimientoAction} className="space-y-4">
          <input type="hidden" name="vehiculo_id" value={vehiculo.id} />
          <input type="hidden" name="terminal_id" value={vehiculo.terminal_id} />
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
                defaultValue={vehiculo.km_actual}
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Kilometraje</th>
              <th className="text-left px-4 py-3">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mantenimientos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay mantenimientos registrados para esta unidad.
                </td>
              </tr>
            ) : (
              mantenimientos.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{TIPO_LABEL[m.tipo]}</td>
                  <td className="px-4 py-3 text-slate-600">{m.kilometraje} km</td>
                  <td className="px-4 py-3 text-slate-600">{m.descripcion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link href="/vehiculos" className="inline-block text-sm font-medium text-brand-dark hover:underline">
        ← Regresar a Flota
      </Link>
    </div>
  )
}