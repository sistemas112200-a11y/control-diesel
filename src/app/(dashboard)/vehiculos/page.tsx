import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'

const ESTADO_LABEL: Record<string, string> = {
  activo: 'Activo',
  taller: 'En taller',
  baja: 'Baja',
}

const ESTADO_COLOR: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  taller: 'bg-amber-100 text-amber-700',
  baja: 'bg-red-100 text-red-700',
}

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const vehiculos = await getVehiculos(supabase, undefined, q)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Flota</h1>
        <Link
          href="/vehiculos/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo vehículo
        </Link>
      </div>

      <form>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por número económico, placas o marca..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Número económico</th>
              <th className="text-left px-4 py-3">Placas</th>
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">Rendimiento esperado</th>
              <th className="text-left px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  {q ? `No se encontraron vehículos para "${q}".` : 'Aún no hay vehículos registrados.'}
                </td>
              </tr>
            ) : (
              vehiculos.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{v.numero_economico}</td>
                  <td className="px-4 py-3 text-slate-600">{v.placas ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{v.marca} {v.modelo}</td>
                  <td className="px-4 py-3 text-slate-600">{v.rendimiento_esperado_km_l} km/L</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[v.estado]}`}>
                      {ESTADO_LABEL[v.estado]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}