import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getReporteById, getRefaccionesPorReporte } from '@/repositories/reporte.repository'
import { getMecanicosActivos } from '@/repositories/mecanico.repository'
import { FirmaPad } from '@/components/ui/firma-pad'
import { OrdenPrioridad } from '@/components/ui/orden-prioridad'
import { OrdenMecanico } from '@/components/ui/orden-mecanico'
import { ESTADO_LABEL, ESTADO_COLOR } from '@/lib/ordenes-trabajo'
import { formatoFechaHora } from '@/lib/fecha'
import {
  tomarReporteAction,
  iniciarTrabajoAction,
  pausarPorRefaccionesAction,
  reanudarTrabajoAction,
  resolverReporteAction,
  agregarRefaccionAction,
} from './actions'

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
  const mecanicos = await getMecanicosActivos(supabase)
  const totalRefacciones = refacciones.reduce((suma, r) => suma + r.cantidad * r.costo, 0)
  const pdfHref = '/reportes-unidad/' + id + '/pdf'
  const paseSalidaHref = '/unidad/' + reporte.vehiculo_id + '/pase-salida'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/reportes-unidad" className="text-xs font-medium text-brand-dark hover:underline">
            Volver a Ordenes de trabajo
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 mt-1">
            {reporte.folio} - {reporte.vehiculos?.numero_economico ?? '-'}
          </h1>
          {reporte.operadores?.nombre_completo && (
            <p className="text-sm text-slate-500">Reportado por: {reporte.operadores.nombre_completo}</p>
          )}
        </div>
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 transition-colors">
          Descargar PDF
        </a>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[reporte.estado]}`}>
              {ESTADO_LABEL[reporte.estado]}
            </span>
            <OrdenPrioridad id={reporte.id} prioridad={reporte.prioridad} />
          </div>
          <span className="text-xs text-slate-500">{formatoFechaHora(reporte.created_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Mecánico:</span>
          <OrdenMecanico id={reporte.id} mecanicoId={reporte.mecanico_id} mecanicos={mecanicos} />
        </div>

        <p className="text-sm text-slate-700">{reporte.descripcion}</p>

        {reporte.estado === 'abierta' && (
          <form action={tomarReporteAction}>
            <input type="hidden" name="id" value={reporte.id} />
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Tomar esta orden
            </button>
          </form>
        )}

        {reporte.estado === 'asignada' && (
          <form action={iniciarTrabajoAction}>
            <input type="hidden" name="id" value={reporte.id} />
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Iniciar trabajo
            </button>
          </form>
        )}

        {reporte.estado === 'en_proceso' && (
          <form action={pausarPorRefaccionesAction}>
            <input type="hidden" name="id" value={reporte.id} />
            <button type="submit" className="rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 transition-colors">
              Pausar (esperando refacciones)
            </button>
          </form>
        )}

        {reporte.estado === 'espera_refacciones' && (
          <form action={reanudarTrabajoAction}>
            <input type="hidden" name="id" value={reporte.id} />
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Reanudar trabajo
            </button>
          </form>
        )}

        {(reporte.estado === 'en_proceso' || reporte.estado === 'espera_refacciones') && (
          <form action={resolverReporteAction} className="space-y-4 pt-2 border-t border-slate-100">
            <input type="hidden" name="id" value={reporte.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posible falla</label>
              <textarea name="posible_falla" rows={2} required placeholder="Ej. Valvula de la llanta danada" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Falla reparada</label>
              <textarea name="solucion" rows={2} required placeholder="Ej. Se cambio la llanta delantera derecha" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Firma del mecanico</label>
              <FirmaPad name="firma_url" />
            </div>
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Marcar como completada
            </button>
          </form>
        )}

        {reporte.estado === 'completada' && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            {reporte.posible_falla && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Posible falla</p>
                <p className="text-sm text-slate-700">{reporte.posible_falla}</p>
              </div>
            )}
            {reporte.solucion && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Falla reparada</p>
                <p className="text-sm text-slate-700">{reporte.solucion}</p>
              </div>
            )}
            {reporte.firma_url && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Firma</p>
                <img src={reporte.firma_url} alt="Firma del mecanico" className="border border-slate-200 rounded-md bg-white h-24" />
              </div>
            )}
            <div className="pt-2">
              <p className="text-sm text-slate-600 mb-2">La unidad ya regreso a estado Activo.</p>
              <Link href={paseSalidaHref} className="inline-block rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
                Generar pase de salida
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Refacciones utilizadas</h2>

        {refacciones.length === 0 ? (
          <p className="text-sm text-slate-500">Aun no se han agregado refacciones.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left py-2">Refaccion</th>
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Refaccion</label>
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
              + Agregar refaccion
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}