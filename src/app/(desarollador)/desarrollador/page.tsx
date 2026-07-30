import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEmpresas, getUsoEmpresa } from '@/repositories/empresa.repository'

export default async function DesarrolladorPage() {
  const supabase = await createClient()
  const empresas = await getEmpresas(supabase)
  const usos = await Promise.all(empresas.map((e) => getUsoEmpresa(supabase, e.id)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Empresas</h1>
        <Link href="/desarrollador/nueva" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
          + Nueva empresa
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Empresa</th>
              <th className="text-left px-4 py-3">Usuarios</th>
              <th className="text-left px-4 py-3">Vehículos</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empresas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Aún no hay empresas registradas.</td>
              </tr>
            ) : (
              empresas.map((e, i) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{e.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {usos[i].usuarios}{e.limite_usuarios != null ? ` / ${e.limite_usuarios}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {usos[i].vehiculos}{e.limite_vehiculos != null ? ` / ${e.limite_vehiculos}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/desarrollador/${e.id}`} className="text-xs font-medium text-brand-dark hover:underline">
                      Administrar
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