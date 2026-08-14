import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCargas } from '@/repositories/carga.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { puedeVerDetalleCargas } from '@/lib/auth/permissions'
import { formatoDistancia, formatoVolumen, formatoRendimiento } from '@/lib/unidades'

function formatoFechaHora(fechaHora: string) {
  return new Date(fechaHora).toLocaleString('es-MX', {
    timeZone: 'America/Chihuahua',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string; q?: string; desde?: string; hasta?: string }>
}) {
  const { alerta, q, desde, hasta } = await searchParams
  const supabase = await createClient()
  const usuarioActual = await getUsuarioActual()
  const empresa = await getEmpresaById(supabase, usuarioActual!.empresaId)
  const unidad = empresa.unidad_medida

  const todasLasCargas = await getCargas(supabase)
  const mostrarDetalle = usuarioActual ? puedeVerDetalleCargas(usuarioActual.rol) : false

  let cargas = todasLasCargas

  if (q) {
    const termino = q.toLowerCase()
    cargas = cargas.filter((c) => {
      const unidadVehiculo = (c as any).vehiculos?.numero_economico ?? ''
      const folio = c.folio_ticket ?? ''
      return unidadVehiculo.toLowerCase().includes(termino) || folio.toLowerCase().includes(termino)
    })
  }

  if (desde) {
    const desdeMs = new Date(`${desde}T00:00:00`).getTime()
    cargas = cargas.filter((c) => new Date(c.fecha_hora).getTime() >= desdeMs)
  }
  if (hasta) {
    const hastaMs = new Date(`${hasta}T23:59:59.999`).getTime()
    cargas = cargas.filter((c) => new Date(c.fecha_hora).getTime() <= hastaMs)
  }

  return (
    <div className="space-y-6">
      {alerta && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Carga guardada, pero se generó una alerta: {alerta}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Cargas de combustible</h1>
        <Link
          href="/cargas/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nueva carga
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-slate-600 mb-1">Buscar</label>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Unidad o folio de ticket..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
          <input
            type="date"
            name="desde"
            defaultValue={desde ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ''}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          Filtrar
        </button>
        {(q || desde || hasta) && (
          <Link href="/cargas" className="text-sm font-medium text-slate-500 hover:underline px-2 py-2">
            Quitar filtros
          </Link>
        )}
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Unidad</th>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">{unidad === 'imperial' ? 'Millaje' : 'Kilometraje'}</th>
              <th className="text-left px-4 py-3">{unidad === 'imperial' ? 'Galones' : 'Litros'}</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Rendimiento</th>
              {mostrarDetalle && <th className="text-left px-4 py-3">Detalle</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargas.length === 0 ? (
              <tr>
                <td colSpan={mostrarDetalle ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                  {q || desde || hasta ? 'No se encontraron cargas con esos filtros.' : 'Aún no hay cargas registradas.'}
                </td>
              </tr>
            ) : (
              cargas.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{(c as any).vehiculos?.numero_economico ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatoFechaHora(c.fecha_hora)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatoDistancia(c.kilometraje, unidad, 0)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatoVolumen(c.litros_cargados, unidad, 2)}</td>
                  <td className="px-4 py-3 text-slate-600">${c.total_pagado.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.rendimiento_km_l ? formatoRendimiento(c.rendimiento_km_l, unidad) : '—'}</td>
                  {mostrarDetalle && (
                    <td className="px-4 py-3">
                      <Link href={`/cargas/${c.id}`} className="text-brand-dark hover:underline font-medium">
                        Ver fotos
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}