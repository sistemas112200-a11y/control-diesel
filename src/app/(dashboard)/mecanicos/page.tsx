import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMecanicos } from '@/repositories/mecanico.repository'

export default async function MecanicosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const supabase = await createClient()
  const mecanicos = await getMecanicos(supabase)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Mecánicos</h1>
        <Link
          href="/mecanicos/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo mecánico
        </Link>
      </div>

      {ok === '1' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Mecánico guardado correctamente.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Especialidad</th>
              <th className="text-left px-4 py-3">Teléfono</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mecanicos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay mecánicos registrados.
                </td>
              </tr>
            ) : (
              mecanicos.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.nombre_completo}</td>
                  <td className="px-4 py-3 text-slate-600">{m.especialidad ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.telefono ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${m.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/mecanicos/${m.id}/editar`} className="text-xs font-medium text-brand-dark hover:underline">
                      Editar
                    </Link>
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