import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProductos } from '@/repositories/producto.repository'

export default async function ProductosPage() {
  const supabase = await createClient()
  const productos = await getProductos(supabase)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Productos</h1>
        <Link
          href="/almacen/productos/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Existencia</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay productos registrados.
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const bajo = p.stock_minimo != null && p.existencia <= p.stock_minimo
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.codigo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={bajo ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {p.existencia} {p.unidad_medida}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link href={`/almacen/productos/${p.id}/editar`} className="text-xs font-medium text-brand-dark hover:underline">
                        Editar
                      </Link>
                      <Link href={`/almacen/productos/${p.id}/codigo`} className="text-xs font-medium text-brand-dark hover:underline">
                        Ver código
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