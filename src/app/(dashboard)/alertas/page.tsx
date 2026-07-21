import { createClient } from '@/lib/supabase/server'
import { getAlertas } from '@/repositories/alerta.repository'
import { cambiarEstadoAlertaAction } from './actions'
import type { EstadoAlerta } from '@/lib/supabase/types'

const TIPO_LABEL: Record<string, string> = {
  rendimiento_bajo: 'Rendimiento bajo',
  carga_duplicada: 'Carga duplicada',
  litros_fuera_rango: 'Litros fuera de rango',
  consumo_excesivo: 'Consumo excesivo',
  sin_movimiento: 'Sin movimiento',
  ticket_repetido: 'Ticket repetido',
  posible_robo: 'Posible robo',
  mantenimiento_vencido: 'Mantenimiento vencido',
}

const SEVERIDAD_COLOR: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  advertencia: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
}

const ESTADO_LABEL: Record<string, string> = {
  nueva: 'Nueva',
  revisada: 'Revisada',
  descartada: 'Descartada',
}

const ESTADO_COLOR: Record<string, string> = {
  nueva: 'bg-red-50 text-red-700 border border-red-200',
  revisada: 'bg-green-100 text-green-700',
  descartada: 'bg-slate-100 text-slate-500',
}

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; severidad?: string }>
}) {
  const { estado, severidad } = await searchParams
  const supabase = await createClient()
  const alertas = await getAlertas(supabase, {
    estado: estado as EstadoAlerta | undefined,
    severidad,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Alertas</h1>

      <form className="flex gap-3">
        <select name="estado" defaultValue={estado ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="nueva">Nuevas</option>
          <option value="revisada">Revisadas</option>
          <option value="descartada">Descartadas</option>
        </select>
        <select name="severidad" defaultValue={severidad ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todas las severidades</option>
          <option value="info">Info</option>
          <option value="advertencia">Advertencia</option>
          <option value="critica">Crítica</option>
        </select>
        <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
          Filtrar
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Severidad</th>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Operador</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alertas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No hay alertas con esos filtros.
                </td>
              </tr>
            ) : (
              alertas.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{TIPO_LABEL[a.tipo] ?? a.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${SEVERIDAD_COLOR[a.severidad]}`}>
                      {a.severidad}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.vehiculos?.numero_economico ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{a.operadores?.nombre_completo ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">{a.descripcion}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[a.estado]}`}>
                      {ESTADO_LABEL[a.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.estado === 'nueva' && (
                      <div className="flex gap-2">
                        <form action={cambiarEstadoAlertaAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="estado" value="revisada" />
                          <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                            Revisar
                          </button>
                        </form>
                        <form action={cambiarEstadoAlertaAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="estado" value="descartada" />
                          <button type="submit" className="text-xs font-medium text-slate-500 hover:underline">
                            Descartar
                          </button>
                        </form>
                      </div>
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