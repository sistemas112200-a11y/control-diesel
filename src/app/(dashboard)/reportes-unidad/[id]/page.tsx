import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getReporteById, getRefaccionesPorReporte } from '@/repositories/reporte.repository'
import { tomarReporteAction, resolverReporteAction, agregarRefaccionAction } from './actions'

const ESTADO_LABEL: Record<string, string> = {
  abierto: 'Abierto',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
}

const ESTADO_COLOR: Record<string, string> = {
  abierto: 'bg-red-100 text-red-700',
  en_proceso: 'bg-amber-100 text-amber-700',
  resuelto: 'bg-green-100 text-green-700',
}

export default async function ReporteDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const reporte = await getReporteById(supabase, id)
  const refacciones = await getRefaccionesPorReporte(supabase, id)
  const totalRefacciones = refacciones.reduce((suma, r) => suma + r.cantidad * r.costo, 0)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/reportes-unidad" className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver a Reportes de unidad
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">
          {reporte.vehiculos?.numero_economico ?? '—'}
        </h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[reporte.estado]}`}>
            {ESTADO_LABEL[reporte.estado]}
          </span>
          <span className="text-xs text-slate-500">{new Date(reporte.created_at).toLocaleString('es-MX')}</span>
        </div>
        <p className="text-sm text-slate-700">{reporte.descripcion}</p>

        {reporte.estado === 'abierto' && (
          <form action={tomarReporteAction}>
            <input type="hidden" name="id" value={reporte.id} />
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Tomar este reporte
            </button>
          </form>
        )}

        {reporte.estado === 'en_proceso' && (
          <form action={resolverReporteAction} className="space-y-3 pt-2 border-t border-slate-100">
            <input type="hidden" name="id" value={reporte.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">¿Qué se le hizo a la unidad?</label>
              <textarea
                name="solucion"
                rows={3}
                required
                placeholder="Ej. Se cambió la llanta delantera derecha"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Marcar como resuelto
            </button>
          </form>
        )}

        {reporte.estado === 'resuelto' && reporte.solucion && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-1">Solución</p>
            <p className="text-sm text-slate-700">{reporte.solucion}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Refacciones utilizadas</h2>

        {refacciones.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no se han agregado refacciones.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left py-2">Refacción</th>
                <th className="text-left py-2">Cantidad</th>
                <th className="text-left py-2">Costo</th>
                <th className="text-left py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {refacciones.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 text-slate-700">{r.descripcion}</td>
                  <td className="py-2 text-slate-600">{r.cantidad}</td>
                  <td className="py-2 text-slate-600">${r.costo.toFixed(2)}</td>
                  <td className="py-2 text-slate-600">${(r.cantidad * r.costo).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 text-right font-medium text-slate-900">Total</td>
                <td className="py-2 font-medium text-slate-900">${totalRefacciones.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        )}

        <form action={agregarRefaccionAction} className="grid grid-cols-4 gap-2 items-end pt-2 border-t border-slate-100">
          <input type="hidden" name="reporte_id" value={reporte.id} />
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Refacción</label>
            <input name="descripcion" required placeholder="Ej. Llanta 295/80 R22.5" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cantidad</label>
            <input name="cantidad" type="number" step="1" defaultValue="1" required className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Costo (c/u)</label>
            <input name="costo" type="number" step="0.01" required className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div className="col-span-4">
            <button type="submit" className="rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 transition-colors">
              + Agregar refacción
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}