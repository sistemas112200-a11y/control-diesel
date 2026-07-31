import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMantenimientos } from '@/repositories/mantenimiento.repository'
import { estaVencido, kmRestantes, diasRestantes } from '@/lib/mantenimiento-estado'

const TIPO_LABEL: Record<string, string> = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
}

function textoKm(valor: number | null): string {
  if (valor == null) return '—'
  if (valor <= 0) return 'Vencido'
  return `${valor.toLocaleString('es-MX')} km`
}

function textoDias(valor: number | null): string {
  if (valor == null) return '—'
  if (valor <= 0) return 'Vencido'
  return `${valor} días`
}

export default async function MantenimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const supabase = await createClient()
  const mantenimientos = await getMantenimientos(supabase)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Mantenimientos</h1>
        <Link
          href="/mantenimientos/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo mantenimiento
        </Link>
      </div>

      {ok === '1' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Mantenimiento actualizado correctamente.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Kilometraje</th>
              <th className="text-left px-4 py-3">Cada cuántos km</th>
              <th className="text-left px-4 py-3">Cada cuántos días</th>
              <th className="text-left px-4 py-3">Faltan (km)</th>
              <th className="text-left px-4 py-3">Faltan (días)</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mantenimientos.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay mantenimientos registrados.
                </td>
              </tr>
            ) : (
              mantenimientos.map((m) => {
                const kmActual = m.vehiculos?.km_actual ?? 0
                const vencido = m.vehiculos ? estaVencido(m, kmActual) : false
                const km = m.vehiculos ? kmRestantes(m, kmActual) : null
                const dias = diasRestantes(m)
                return (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{m.vehiculos?.numero_economico ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{TIPO_LABEL[m.tipo]}</td>
                    <td className="px-4 py-3 text-slate-600">{m.kilometraje} km</td>
                    <td className="px-4 py-3 text-slate-600">{m.intervalo_km ? `${m.intervalo_km} km` : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{m.intervalo_dias ? `${m.intervalo_dias} días` : '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{textoKm(km)}</td>
                    <td className="px-4 py-3 text-slate-600">{textoDias(dias)}</td>
                    <td className="px-4 py-3 text-slate-600">{m.descripcion}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${vencido ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {vencido ? 'Vencido' : 'Al día'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/mantenimientos/${m.id}/editar`} className="text-xs font-medium text-brand-dark hover:underline">
                        Editar
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