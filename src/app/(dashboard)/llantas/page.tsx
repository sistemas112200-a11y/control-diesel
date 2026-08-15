import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLlantasSemaforo, type LlantaSemaforo } from '@/repositories/llanta.repository'
import { generarEjes, etiquetaPosicion } from '@/lib/llantas-config'

type EstadoVisual = 'bien' | 'atencion' | 'critico' | 'sin_medir'

function estadoVisualLlanta(llanta: LlantaSemaforo): EstadoVisual {
  if (llanta.profundidad_actual_mm == null) return 'sin_medir'
  if (llanta.profundidad_actual_mm <= llanta.profundidad_minima_mm) return 'critico'
  if (llanta.presion_actual_psi != null && llanta.presion_recomendada_psi) {
    const diferencia = Math.abs(llanta.presion_actual_psi - llanta.presion_recomendada_psi) / llanta.presion_recomendada_psi
    if (diferencia > 0.15) return 'atencion'
  }
  const margen = llanta.profundidad_actual_mm - llanta.profundidad_minima_mm
  if (margen <= 2) return 'atencion'
  return 'bien'
}

const COLOR_ESTADO: Record<EstadoVisual, string> = {
  bien: 'bg-green-100 border-green-400 text-green-700',
  atencion: 'bg-amber-100 border-amber-400 text-amber-700',
  critico: 'bg-red-100 border-red-400 text-red-700',
  sin_medir: 'bg-slate-200 border-slate-300 text-slate-500',
}

const LABEL_ESTADO: Record<EstadoVisual, string> = {
  bien: 'Bien',
  atencion: 'Revisar',
  critico: 'Crítico',
  sin_medir: 'Sin medir',
}

function formatoFecha(fecha: string | null) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Chihuahua',
  })
}

// Calcula, para cada vehículo, en qué número (1, 2, 3...) cae cada posición,
// en el mismo orden en que se dibujan en el diagrama de la unidad.
function construirNumeracionPorVehiculo(llantas: LlantaSemaforo[]) {
  const mapa = new Map<string, Map<string, number>>()

  for (const llanta of llantas) {
    const vehiculoId = llanta.vehiculo_id
    const vehiculo = llanta.vehiculos
    if (!vehiculoId || !vehiculo || mapa.has(vehiculoId)) continue

    const ejes = generarEjes(vehiculo.numero_llantas, vehiculo.tiene_eje_delantero)
    const posiciones = ejes.flatMap((eje) => eje.posiciones)
    const numeroPorPosicion = new Map<string, number>()
    posiciones.forEach((p, i) => numeroPorPosicion.set(p.posicion, i + 1))
    mapa.set(vehiculoId, numeroPorPosicion)
  }

  return mapa
}

export default async function SemaforeoLlantasPage() {
  const supabase = await createClient()
  const llantas = await getLlantasSemaforo(supabase)
  const numeracionPorVehiculo = construirNumeracionPorVehiculo(llantas)

  const filas = llantas
    .map((llanta) => {
      const kmActual = llanta.vehiculos?.km_actual ?? null
      const kmRecorridos =
        llanta.km_instalacion != null && kmActual != null ? kmActual - llanta.km_instalacion : null
      const costoPorKm =
        llanta.costo != null && kmRecorridos != null && kmRecorridos > 0 ? llanta.costo / kmRecorridos : null
      const numero =
        llanta.vehiculo_id && llanta.posicion
          ? numeracionPorVehiculo.get(llanta.vehiculo_id)?.get(llanta.posicion) ?? null
          : null

      return { llanta, kmRecorridos, costoPorKm, numero, estado: estadoVisualLlanta(llanta) }
    })
    .sort((a, b) => {
      const unidadA = a.llanta.vehiculos?.numero_economico ?? ''
      const unidadB = b.llanta.vehiculos?.numero_economico ?? ''
      if (unidadA !== unidadB) return unidadA.localeCompare(unidadB)
      return (a.numero ?? 999) - (b.numero ?? 999)
    })

  const conteos = filas.reduce(
    (acc, f) => {
      acc[f.estado]++
      return acc
    },
    { bien: 0, atencion: 0, critico: 0, sin_medir: 0 } as Record<EstadoVisual, number>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Semaforeo de llantas</h1>
        <p className="text-sm text-slate-500 mt-1">Todas las unidades y sus llantas en un solo lugar.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium border ${COLOR_ESTADO.bien}`}>
          Bien: {conteos.bien}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium border ${COLOR_ESTADO.atencion}`}>
          Revisar: {conteos.atencion}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium border ${COLOR_ESTADO.critico}`}>
          Crítico: {conteos.critico}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-medium border ${COLOR_ESTADO.sin_medir}`}>
          Sin medir: {conteos.sin_medir}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">N°</th>
              <th className="text-left px-4 py-3">Posición</th>
              <th className="text-left px-4 py-3">Marca / medida</th>
              <th className="text-left px-4 py-3">N° serie</th>
              <th className="text-left px-4 py-3">Profundidad</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha instalación</th>
              <th className="text-right px-4 py-3">Costo</th>
              <th className="text-right px-4 py-3">Costo/km</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-slate-500">
                  Todavía no hay llantas registradas.
                </td>
              </tr>
            ) : (
              filas.map(({ llanta, costoPorKm, numero, estado }) => (
                <tr key={llanta.id}>
                  <td className="px-4 py-3 text-slate-900 font-medium">{llanta.vehiculos?.numero_economico ?? '—'}</td>
                  <td className="px-4 py-3">
                    {numero != null && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                        {numero}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{etiquetaPosicion(llanta.posicion)}</td>
                  <td className="px-4 py-3 text-slate-600">{llanta.marca} {llanta.medida ?? ''}</td>
                  <td className="px-4 py-3 text-slate-600">{llanta.numero_serie ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {llanta.profundidad_actual_mm != null ? `${llanta.profundidad_actual_mm} mm` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium border ${COLOR_ESTADO[estado]}`}>
                      {LABEL_ESTADO[estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatoFecha(llanta.fecha_instalacion)}</td>
                  <td className="px-4 py-3 text-slate-600 text-right">
                    {llanta.costo != null ? `$${llanta.costo.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-right">
                    {costoPorKm != null ? `$${costoPorKm.toFixed(3)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {llanta.vehiculo_id && (
                      <Link
                        href={`/llantas/${llanta.vehiculo_id}/${llanta.id}`}
                        className="text-xs font-medium text-brand-dark hover:underline"
                      >
                        Ver
                      </Link>
                    )}
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