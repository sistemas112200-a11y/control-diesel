import { createClient } from '@/lib/supabase/server'
import { getAvisos } from '@/repositories/aviso.repository'
import { getEmpresas } from '@/repositories/empresa.repository'
import { crearAvisoAction, desactivarAvisoAction } from './actions'

const TIPO_LABEL: Record<string, string> = {
  info: 'Info',
  advertencia: 'Advertencia',
  critica: 'Crítica',
}

const TIPO_COLOR: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  advertencia: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
}

export default async function AvisosPage() {
  const supabase = await createClient()
  const avisos = await getAvisos(supabase)
  const empresas = await getEmpresas(supabase)

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Avisos</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Nuevo aviso</h2>
        <form action={crearAvisoAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
            <textarea name="mensaje" rows={2} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <select name="empresa_id" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Todas las empresas</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select name="tipo" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="info">Info</option>
                <option value="advertencia">Advertencia</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expira (opcional)</label>
              <input name="expira_at" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
            Publicar aviso
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Mensaje</th>
              <th className="text-left px-4 py-3">Empresa</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {avisos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Aún no hay avisos.</td>
              </tr>
            ) : (
              avisos.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-700 max-w-md">{a.mensaje}</td>
                  <td className="px-4 py-3 text-slate-600">{a.empresas?.nombre ?? 'Todas'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${TIPO_COLOR[a.tipo]}`}>
                      {TIPO_LABEL[a.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${a.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {a.activo ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.activo && (
                      <form action={desactivarAvisoAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                          Desactivar
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