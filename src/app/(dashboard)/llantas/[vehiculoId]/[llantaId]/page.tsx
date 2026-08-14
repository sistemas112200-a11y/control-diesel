import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLlantaById } from '@/repositories/llanta.repository'
import { getMedicionesPorLlanta } from '@/repositories/medicion-llanta.repository'
import { etiquetaPosicion } from '@/lib/llantas-config'
import { registrarMedicionAction, darDeBajaLlantaAction } from './actions'

export default async function LlantaDetallePage({
  params,
}: {
  params: Promise<{ vehiculoId: string; llantaId: string }>
}) {
  const { vehiculoId, llantaId } = await params
  const supabase = await createClient()
  const llanta = await getLlantaById(supabase, llantaId)
  const mediciones = await getMedicionesPorLlanta(supabase, llantaId)

  const margen = llanta.profundidad_actual_mm != null ? llanta.profundidad_actual_mm - llanta.profundidad_minima_mm : null

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/llantas/${vehiculoId}`} className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver al tracto
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">
          {llanta.marca} {llanta.modelo ?? ''}
        </h1>
        <p className="text-sm text-slate-500">
          {etiquetaPosicion(llanta.posicion)} · {llanta.medida ?? 'Sin medida'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Profundidad actual</p>
          <p className="text-xl font-semibold text-slate-900">
            {llanta.profundidad_actual_mm != null ? `${llanta.profundidad_actual_mm} mm` : '—'}
          </p>
          {margen != null && (
            <p className={`text-xs mt-1 ${margen <= 2 ? 'text-red-600' : 'text-slate-500'}`}>
              Mínima: {llanta.profundidad_minima_mm} mm
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Presión actual</p>
          <p className="text-xl font-semibold text-slate-900">
            {llanta.presion_actual_psi != null ? `${llanta.presion_actual_psi} psi` : '—'}
          </p>
          {llanta.presion_recomendada_psi != null && (
            <p className="text-xs text-slate-500 mt-1">Recomendada: {llanta.presion_recomendada_psi} psi</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Km última medición</p>
          <p className="text-xl font-semibold text-slate-900">
            {llanta.km_ultima_medicion != null ? llanta.km_ultima_medicion.toLocaleString('es-MX') : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Estado</p>
          <p className="text-xl font-semibold text-slate-900 capitalize">{llanta.estado.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Registrar medición</h2>
          <form action={registrarMedicionAction} className="space-y-4">
            <input type="hidden" name="llanta_id" value={llantaId} />
            <input type="hidden" name="vehiculo_id" value={vehiculoId} />
            <Campo label="Kilometraje actual" name="km_vehiculo" type="number" required />
            <div className="grid grid-cols-3 gap-3">
              <Campo label="Interior (mm)" name="profundidad_interior_mm" type="number" step="0.1" required />
              <Campo label="Centro (mm)" name="profundidad_centro_mm" type="number" step="0.1" required />
              <Campo label="Exterior (mm)" name="profundidad_exterior_mm" type="number" step="0.1" required />
            </div>
            <Campo label="Presión (psi)" name="presion_psi" type="number" step="0.1" required />
            <Campo label="Observaciones" name="observaciones" />
            <button
              type="submit"
              className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
            >
              Guardar medición
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Historial de mediciones</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Fecha</th>
                <th className="text-left px-4 py-2">Km</th>
                <th className="text-left px-4 py-2">Prof. prom.</th>
                <th className="text-left px-4 py-2">Presión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mediciones.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Todavía no hay mediciones registradas.
                  </td>
                </tr>
              ) : (
                mediciones.map((m) => {
                  const promedio = (m.profundidad_interior_mm + m.profundidad_centro_mm + m.profundidad_exterior_mm) / 3
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-2 text-slate-600">
                        {new Date(m.fecha_hora).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{m.km_vehiculo.toLocaleString('es-MX')}</td>
                      <td className="px-4 py-2 text-slate-600">{promedio.toFixed(1)} mm</td>
                      <td className="px-4 py-2 text-slate-600">{m.presion_psi} psi</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {llanta.estado === 'en_uso' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Dar de baja</h2>
          <form action={darDeBajaLlantaAction} className="space-y-4 max-w-md">
            <input type="hidden" name="llanta_id" value={llantaId} />
            <input type="hidden" name="vehiculo_id" value={vehiculoId} />
            <Campo label="Kilometraje al dar de baja" name="km_baja" type="number" required />
            <Campo label="Motivo" name="motivo_baja" required />
            <button
              type="submit"
              className="rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium px-4 py-2 transition-colors"
            >
              Dar de baja esta llanta
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Campo({
  label,
  name,
  type = 'text',
  required = false,
  step,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  step?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )
}