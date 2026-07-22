import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { crearReporteAction } from './actions'

export default async function ReportarProblemaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  const { id } = await params
  const { error, ok } = await searchParams
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Reportar un problema — {vehiculo.numero_economico}</h1>

      {ok === '1' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Reporte enviado. Gracias.
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <form action={crearReporteAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="vehiculo_id" value={vehiculo.id} />
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
          Enviar reporte
        </button>
      </form>
    </div>
  )
}