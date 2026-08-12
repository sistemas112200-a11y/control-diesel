import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculos } from '@/repositories/vehiculo.repository'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { formatoRendimiento } from '@/lib/unidades'
import { cambiarEstadoVehiculoAction } from './actions'

const ESTADO_LABEL: Record<string, string> = {
  activo: 'Activo',
  taller: 'En taller',
  baja: 'Fuera de servicio',
}

const ESTADO_COLOR: Record<string, string> = {
  activo: 'bg-green-100 text-green-700',
  taller: 'bg-amber-100 text-amber-700',
  baja: 'bg-red-100 text-red-700',
}

const PESTAÑAS: { valor: string; label: string }[] = [
  { valor: '', label: 'Todas' },
  { valor: 'activo', label: 'Activas' },
  { valor: 'taller', label: 'En taller' },
  { valor: 'baja', label: 'Fuera de servicio' },
]

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ok?: string; estado?: string }>
}) {
  const { q, ok, estado } = await searchParams
  const supabase = await createClient()
  const usuario = await getUsuarioActual()
  const empresa = usuario ? await getEmpresaById(supabase, usuario.empresaId) : null
  const unidad = empresa?.unidad_medida ?? 'metrico'

  const todosLosVehiculos = await getVehiculos(supabase, undefined, q)

  const vehiculos = estado ? todosLosVehiculos.filter((v) => v.estado === estado) : todosLosVehiculos

  const conteos: Record<string, number> = {
    '': todosLosVehiculos.length,
    activo: todosLosVehiculos.filter((v) => v.estado === 'activo').length,
    taller: todosLosVehiculos.filter((v) => v.estado === 'taller').length,
    baja: todosLosVehiculos.filter((v) => v.estado === 'baja').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Flota</h1>
        <Link
          href="/vehiculos/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo vehículo
        </Link>
      </div>

      {ok === 'vehiculo' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Vehículo actualizado correctamente.
        </div>
      )}

      <div className="flex items-center gap-2">
        {PESTAÑAS.map((p) => {
          const activa = (estado ?? '') === p.valor
          const params = new URLSearchParams()
          if (q) params.set('q', q)
          if (p.valor) params.set('estado', p.valor)
          const href = params.toString() ? `/vehiculos?${params.toString()}` : '/vehiculos'
          return (
            <Link
              key={p.valor}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activa ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label} ({conteos[p.valor]})
            </Link>
          )
        })}
      </div>

      <form>
        {estado && <input type="hidden" name="estado" value={estado} />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por número económico, placas o marca..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Número económico</th>
              <th className="text-left px-4 py-3">Placas</th>
              <th className="text-left px-4 py-3">Marca / Modelo</th>
              <th className="text-left px-4 py-3">Rendimiento esperado</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehiculos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {q ? `No se encontraron vehículos para "${q}".` : 'No hay vehículos en este estado.'}
                </td>
              </tr>
            ) : (
              vehiculos.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{v.numero_economico}</td>
                  <td className="px-4 py-3 text-slate-600">{v.placas ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{v.marca} {v.modelo}</td>
                  <td className="px-4 py-3 text-slate-600">{formatoRendimiento(v.rendimiento_esperado_km_l, unidad)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${ESTADO_COLOR[v.estado]}`}>
                      {ESTADO_LABEL[v.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/vehiculos/${v.id}/editar`} className="text-xs font-medium text-brand-dark hover:underline">
                        Editar
                      </Link>
                      <Link href={`/vehiculos/${v.id}/qr`} className="text-xs font-medium text-brand-dark hover:underline">
                        Ver QR
                      </Link>
                      <form action={cambiarEstadoVehiculoAction}>
                        <input type="hidden" name="id" value={v.id} />
                        <input type="hidden" name="nuevo_estado" value={v.estado === 'activo' ? 'baja' : 'activo'} />
                        <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                          {v.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </div>
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