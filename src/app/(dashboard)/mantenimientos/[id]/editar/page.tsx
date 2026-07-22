import { createClient } from '@/lib/supabase/server'
import { getMantenimientoById } from '@/repositories/mantenimiento.repository'
import { actualizarMantenimientoAction } from './actions'

export default async function EditarMantenimientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const mantenimiento = await getMantenimientoById(supabase, id)

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Editar mantenimiento</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <form action={actualizarMantenimientoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="id" value={mantenimiento.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
            <select name="tipo" defaultValue={mantenimiento.tipo} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometraje</label>
            <input
              name="kilometraje"
              type="number"
              defaultValue={String(mantenimiento.kilometraje)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
          <input
            name="fecha"
            type="date"
            defaultValue={mantenimiento.fecha}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={2}
            defaultValue={mantenimiento.descripcion}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors">
          Guardar cambios
        </button>
      </form>
    </div>
  )
}