import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOperadores } from '@/repositories/operador.repository'
import { cambiarEstadoOperadorAction } from './actions'

export default async function OperadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const operadores = await getOperadores(supabase, q)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Operadores</h1>
        <Link
          href="/operadores/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo operador
        </Link>
      </div>

      <form>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por nombre o número de licencia..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Licencia</th>
              <th className="text-left px-4 py-3">Teléfono</th>
              <th className="text-left px-4 py-3">Fecha de ingreso</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operadores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {q ? `No se encontraron operadores para "${q}".` : 'Aún no hay operadores registrados.'}
                </td>
              </tr>
            ) : (
              operadores.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{o.nombre_completo}</td>
                  <td className="px-4 py-3 text-slate-600">{o.licencia_numero ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{o.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{o.fecha_ingreso ? new Date(o.fecha_ingreso).toLocaleDateString('es-MX') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${o.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {o.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={cambiarEstadoOperadorAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="nuevo_estado" value={String(!o.activo)} />
                      <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                        {o.activo ? 'Dar de baja' : 'Reactivar'}
                      </button>
                    </form>
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