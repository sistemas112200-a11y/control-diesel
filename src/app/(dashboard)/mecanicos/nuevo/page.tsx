import Link from 'next/link'
import { crearMecanicoAction } from './actions'

export default function NuevoMecanicoPage() {
  return (
    <div className="max-w-lg space-y-6">
      <Link href="/mecanicos" className="text-sm text-slate-500 hover:text-slate-700">← Mecánicos</Link>
      <h1 className="text-lg font-semibold text-slate-900">Nuevo mecánico</h1>

      <form action={crearMecanicoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
          <input
            type="text"
            name="nombre_completo"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Especialidad (opcional)</label>
          <input
            type="text"
            name="especialidad"
            placeholder="Ej. Motor, Eléctrico, Llantas"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (opcional)</label>
          <input
            type="text"
            name="telefono"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/mecanicos" className="rounded-md border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}