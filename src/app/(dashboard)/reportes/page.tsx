import { createClient } from '@/lib/supabase/server'

interface FilaReporte {
  vehiculo_id: string
  numero_economico: string
  litros: number
  gasto: number
  cargas: number
  rendimientoPromedio: number
}

export default async function ReportesPage() {
  const supabase = await createClient()

  const { data: cargas } = await supabase
    .from('cargas_combustible')
    .select('vehiculo_id, litros_cargados, total_pagado, rendimiento_km_l, vehiculos(numero_economico)')
    .is('deleted_at', null)

  const porVehiculo = new Map<string, FilaReporte>()

  for (const c of cargas ?? []) {
    const key = c.vehiculo_id
    const numeroEconomico = (c.vehiculos as any)?.numero_economico ?? '—'
    const fila = porVehiculo.get(key) ?? {
      vehiculo_id: key,
      numero_economico: numeroEconomico,
      litros: 0,
      gasto: 0,
      cargas: 0,
      rendimientoPromedio: 0,
    }
    fila.litros += c.litros_cargados
    fila.gasto += c.total_pagado
    fila.cargas += 1
    if (c.rendimiento_km_l != null) {
      fila.rendimientoPromedio =
        (fila.rendimientoPromedio * (fila.cargas - 1) + c.rendimiento_km_l) / fila.cargas
    }
    porVehiculo.set(key, fila)
  }

  const filas = Array.from(porVehiculo.values())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Reportes — Consumo por unidad</h1>
        <a href="/api/reportes/consumo-por-unidad" className="rounded-md border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50 transition-colors">
          Exportar CSV
        </a>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Cargas</th>
              <th className="text-left px-4 py-3">Litros totales</th>
              <th className="text-left px-4 py-3">Gasto total</th>
              <th className="text-left px-4 py-3">Rendimiento promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay cargas registradas.
                </td>
              </tr>
            ) : (
              filas.map((f) => (
                <tr key={f.vehiculo_id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{f.numero_economico}</td>
                  <td className="px-4 py-3 text-slate-600">{f.cargas}</td>
                  <td className="px-4 py-3 text-slate-600">{f.litros.toFixed(0)} L</td>
                  <td className="px-4 py-3 text-slate-600">${f.gasto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-slate-600">{f.rendimientoPromedio.toFixed(2)} km/L</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}