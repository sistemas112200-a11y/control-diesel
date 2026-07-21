import { createClient } from '@/lib/supabase/server'

interface FilaVehiculo {
  vehiculo_id: string
  numero_economico: string
  litros: number
  gasto: number
  cargas: number
  rendimientoPromedio: number
}

interface FilaOperador {
  operador_id: string
  nombre: string
  litros: number
  gasto: number
  cargas: number
  rendimientoPromedio: number
}

export default async function ReportesPage() {
  const supabase = await createClient()

  const { data: cargas } = await supabase
    .from('cargas_combustible')
    .select('vehiculo_id, operador_id, litros_cargados, total_pagado, rendimiento_km_l, vehiculos(numero_economico), operadores(nombre_completo)')
    .is('deleted_at', null)

  const porVehiculo = new Map<string, FilaVehiculo>()
  const porOperador = new Map<string, FilaOperador>()

  for (const c of cargas ?? []) {
    // --- por vehículo (igual que antes) ---
    const keyVehiculo = c.vehiculo_id
    const numeroEconomico = (c.vehiculos as any)?.numero_economico ?? '—'
    const filaVehiculo = porVehiculo.get(keyVehiculo) ?? {
      vehiculo_id: keyVehiculo,
      numero_economico: numeroEconomico,
      litros: 0,
      gasto: 0,
      cargas: 0,
      rendimientoPromedio: 0,
    }
    filaVehiculo.litros += c.litros_cargados
    filaVehiculo.gasto += c.total_pagado
    filaVehiculo.cargas += 1
    if (c.rendimiento_km_l != null) {
      filaVehiculo.rendimientoPromedio =
        (filaVehiculo.rendimientoPromedio * (filaVehiculo.cargas - 1) + c.rendimiento_km_l) / filaVehiculo.cargas
    }
    porVehiculo.set(keyVehiculo, filaVehiculo)

    // --- por operador (nuevo) ---
    const keyOperador = c.operador_id
    if (keyOperador) {
      const nombre = (c.operadores as any)?.nombre_completo ?? '—'
      const filaOperador = porOperador.get(keyOperador) ?? {
        operador_id: keyOperador,
        nombre,
        litros: 0,
        gasto: 0,
        cargas: 0,
        rendimientoPromedio: 0,
      }
      filaOperador.litros += c.litros_cargados
      filaOperador.gasto += c.total_pagado
      filaOperador.cargas += 1
      if (c.rendimiento_km_l != null) {
        filaOperador.rendimientoPromedio =
          (filaOperador.rendimientoPromedio * (filaOperador.cargas - 1) + c.rendimiento_km_l) / filaOperador.cargas
      }
      porOperador.set(keyOperador, filaOperador)
    }
  }

  const filasVehiculo = Array.from(porVehiculo.values())
  const filasOperador = Array.from(porOperador.values()).sort(
    (a, b) => a.rendimientoPromedio - b.rendimientoPromedio
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Reportes — Consumo por unidad</h1>
        <a
          href="/api/reportes/consumo-por-unidad"
          className="rounded-md border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50 transition-colors"
        >
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
            {filasVehiculo.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay cargas registradas.
                </td>
              </tr>
            ) : (
              filasVehiculo.map((f) => (
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

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Rendimiento por operador</h2>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Operador</th>
                <th className="text-left px-4 py-3">Cargas</th>
                <th className="text-left px-4 py-3">Litros totales</th>
                <th className="text-left px-4 py-3">Gasto total</th>
                <th className="text-left px-4 py-3">Rendimiento promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filasOperador.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Aún no hay cargas registradas.
                  </td>
                </tr>
              ) : (
                filasOperador.map((f) => (
                  <tr key={f.operador_id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{f.nombre}</td>
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
    </div>
  )
}