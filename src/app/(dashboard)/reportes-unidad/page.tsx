import { createClient } from '@/lib/supabase/server'
import { getReportes } from '@/repositories/reporte.repository'
import { marcarResueltoAction } from './actions'

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  resuelto: 'Resuelto',
}

const ESTADO_COLOR: Record<string, string> = {
  abierto: 'bg-red-100 text-red-700',
  resuelto: 'bg-green-100 text-green-700',
}

export default async function ReportesUnidadPage() {
  const supabase = await createClient()
  const reportes = await getReportes(supabase)

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Reportes de unidad</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No hay reportes registrados.
                </td>
              </tr>
            ) : (
              reportes.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(r.created_at).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.vehiculos?.numero_economico ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.descripcion}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[r.estado]}`}>
                      {ESTADO_LABEL[r.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.estado === 'abierto' && (
                      <form action={marcarResueltoAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                          Marcar resuelto
                        </button>
                      </form>
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