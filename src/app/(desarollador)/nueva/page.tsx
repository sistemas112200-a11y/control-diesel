import { crearEmpresaAction } from './actions'

export default function NuevaEmpresaPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nueva empresa</h1>

      <form action={crearEmpresaAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la empresa</label>
          <input name="nombre" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">RFC (opcional)</label>
          <input name="rfc" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la primera terminal</label>
          <input name="terminal_nombre" defaultValue="Matriz" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Crear empresa
        </button>
      </form>
    </div>
  )
}