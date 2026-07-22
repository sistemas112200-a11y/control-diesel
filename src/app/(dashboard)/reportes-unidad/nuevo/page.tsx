import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { BuscadorUnidad } from '@/components/ui/buscador-unidad'
import { crearReporteAction } from './actions'

export default async function NuevoReportePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const todosLosVehiculos = await getVehiculos(supabase)
  const vehiculos = todosLosVehiculos.filter((v) => v.estado === 'activo')

  const { data: operadores } = await supabase
    .from('operadores')
    .select('id, nombre_completo')
    .is('deleted_at', null)
    .eq('activo', true)

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo reporte</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <form action={crearReporteAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <BuscadorUnidad
            name="vehiculo_id"
            opciones={vehiculos.map((v) => ({ id: v.id, label: v.numero_economico }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operador que reporta</label>
          <select name="operador_id" required defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>Selecciona...</option>
            {(operadores ?? []).map((o) => (
              <option key={o.id} value={o.id}>{o.nombre_completo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">¿Qué problema tiene la unidad?</label>
          <textarea
            name="descripcion"
            rows={4}
            required
            placeholder="Ej. Se ponchó una llanta, hace un ruido raro al frenar..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors">
          Guardar reporte
        </button>
      </form>
    </div>
  )
}