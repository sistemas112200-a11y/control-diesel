import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProductoById } from '@/repositories/producto.repository'
import { actualizarProductoAction } from './actions'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const producto = await getProductoById(supabase, id)
  if (!producto) notFound()

  const actionConId = actualizarProductoAction.bind(null, id)

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/almacen/productos" className="text-sm text-slate-500 hover:text-slate-700">← Productos</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Editar producto</h1>
        <Link href={`/almacen/productos/${id}/codigo`} className="text-xs font-medium text-brand-dark hover:underline">
          Ver código de barras
        </Link>
      </div>

      <form action={actionConId} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            defaultValue={producto.nombre}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
          <input
            type="text"
            name="descripcion"
            defaultValue={producto.descripcion ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de medida</label>
            <select name="unidad_medida" defaultValue={producto.unidad_medida} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="pieza">Pieza</option>
              <option value="litro">Litro</option>
              <option value="caja">Caja</option>
              <option value="metro">Metro</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Existencia</label>
            <input
              type="number"
              name="existencia"
              step="1"
              defaultValue={producto.existencia}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Aviso de existencia mínima (opcional)</label>
          <input
            type="number"
            name="stock_minimo"
            step="1"
            defaultValue={producto.stock_minimo ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="activo"
            id="activo"
            defaultChecked={producto.activo}
            className="rounded border-slate-300 text-brand focus:ring-brand"
          />
          <label htmlFor="activo" className="text-sm text-slate-700">Activo</label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/almacen/productos" className="rounded-md border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}