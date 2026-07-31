import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getReportes, transicionesPermitidas } from '@/repositories/reporte.repository'
import { ESTADO_LABEL, PRIORIDAD_LABEL, PRIORIDAD_COLOR, COLUMNAS_ESTADO } from '@/lib/ordenes-trabajo'
import { OrdenMover } from '@/components/ui/orden-mover'
import type { EstadoReporte } from '@/lib/supabase/types'

export default async function ReportesUnidadPage() {
  const supabase = await createClient()
  const reportes = await getReportes(supabase)

  const columnas = new Map<EstadoReporte, typeof reportes>()
  for (const estado of COLUMNAS_ESTADO) columnas.set(estado, [])
  for (const r of reportes) {
    columnas.get(r.estado)?.push(r)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Órdenes de trabajo</h1>
          <p className="text-sm text-slate-500 mt-1">{reportes.length} órdenes registradas</p>
        </div>
        <Link
          href="/reportes-unidad/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nueva orden
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNAS_ESTADO.map((estado) => {
          const items = columnas.get(estado) ?? []
          return (
            <div key={estado} className="min-w-[240px] flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-slate-700">{ESTADO_LABEL[estado]}</h2>
                <span className="text-xs text-slate-400">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin órdenes</p>
                ) : (
                  items.map((r) => (
                    <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">{r.folio}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORIDAD_COLOR[r.prioridad]}`}>
                          {PRIORIDAD_LABEL[r.prioridad]}
                        </span>
                      </div>
                      <Link href={`/reportes-unidad/${r.id}`} className="block">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{r.descripcion}</p>
                        <p className="text-xs text-slate-500 mt-1">{r.vehiculos?.numero_economico ?? '—'}</p>
                        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('es-MX')}</p>
                        {r.mecanicos?.nombre_completo && (
                          <p className="text-xs text-brand-dark mt-1">🔧 {r.mecanicos.nombre_completo}</p>
                        )}
                      </Link>
                      <OrdenMover id={r.id} opciones={transicionesPermitidas(r.estado)} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}