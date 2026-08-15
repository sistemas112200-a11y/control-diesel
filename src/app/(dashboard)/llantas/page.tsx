import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { getLlantas } from '@/repositories/llanta.repository'

export default async function LlantasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const [vehiculos, llantas] = await Promise.all([
    getVehiculos(supabase, undefined, q),
    getLlantas(supabase, { estado: 'en_uso' }),
  ])

  const llantasPorVehiculo = new Map<string, typeof llantas>()
  for (const llanta of llantas) {
    if (!llanta.vehiculo_id) continue
    const lista = llantasPorVehiculo.get(llanta.vehiculo_id) ?? []
    lista.push(llanta)
    llantasPorVehiculo.set(llanta.vehiculo_id, lista)
  }

  function contarAlertas(lista: typeof llantas) {
    return lista.filter(
      (l) => l.profundidad_actual_mm != null && l.profundidad_actual_mm <= l.profundidad_minima_mm
    ).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Llantas</h1>
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
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">Llantas registradas</th>
              <th className="text-left px-4 py-3">Alertas</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay vehículos que coincidan.
                </td>
              </tr>
            ) : (
              vehiculos.map((v) => {
                const lista = llantasPorVehiculo.get(v.id) ?? []
                const alertas = contarAlertas(lista)
                return (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{v.numero_economico}</td>
                    <td className="px-4 py-3 text-slate-600">{v.marca} {v.modelo}</td>
                    <td className="px-4 py-3 text-slate-600">{lista.length} / 6</td>
                    <td className="px-4 py-3">
                      {alertas > 0 ? (
                        <span className="rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                          {alertas} con profundidad baja
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          Sin alertas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/llantas/${v.id}`} className="text-xs font-medium text-brand-dark hover:underline">
                        Ver llantas
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}