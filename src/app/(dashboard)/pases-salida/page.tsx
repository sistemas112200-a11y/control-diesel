import { createClient } from '@/lib/supabase/server'
import { getPasesSalida } from '@/repositories/pase-salida.repository'

export default async function PasesSalidaPage() {
  const supabase = await createClient()
  const pases = await getPasesSalida(supabase)

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Pases de salida</h1>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Destino</th>
              <th className="text-left px-4 py-3">Firmas</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pases.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay pases de salida registrados.
                </td>
              </tr>
            ) : (
              pases.map((p) => {
                const firmas = [p.firma1_nombre, p.firma2_nombre, p.firma3_nombre].filter(Boolean).length
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-slate-600">{new Date(p.created_at).toLocaleString('es-MX')}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.vehiculos?.numero_economico ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.destino ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{firmas} de 3</td>
                    <td className="px-4 py-3">
                      <a href={`/pases-salida/${p.id}/pdf`} className="text-xs font-medium text-brand-dark hover:underline">
                        Descargar PDF
                      </a>
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