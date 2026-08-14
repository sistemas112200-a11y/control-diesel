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

  const parametrosExportar = new URLSearchParams()
  if (q) parametrosExportar.set('q', q)
  if (desde) parametrosExportar.set('desde', desde)
  if (hasta) parametrosExportar.set('hasta', hasta)
  const hrefExportar = `/cargas/exportar${
    parametrosExportar.toString() ? `?${parametrosExportar.toString()}` : ''
  }`

  const hayFiltros = Boolean(q || desde || hasta)

  return (
    <div className="p-6">
      {alerta && (
        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {alerta}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">Cargas de combustible</h1>
        <div className="flex gap-2">
          <Link
            href={hrefExportar}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Exportar CSV
          </Link>
          <Link
            href="/cargas/nuevo"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Nueva carga
          </Link>
        </div>
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-gray-600">
            Buscar (unidad o folio)
          </label>
          <input
            type="text"
            id="q"
            name="q"
            defaultValue={q ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Ej. TEC-123"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="desde" className="text-xs font-medium text-gray-600">
            Desde
          </label>
          <input
            type="date"
            id="desde"
            name="desde"
            defaultValue={desde ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="hasta" className="text-xs font-medium text-gray-600">
            Hasta
          </label>
          <input
            type="date"
            id="hasta"
            name="hasta"
            defaultValue={hasta ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Filtrar
        </button>
        {hayFiltros && (
          <Link href="/cargas" className="text-sm font-medium text-blue-600 hover:underline">
            Quitar filtros
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha y hora</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Unidad</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Folio</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                {unidad === 'imperial' ? 'Millaje' : 'Kilometraje'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                {unidad === 'imperial' ? 'Galones' : 'Litros'}
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rendimiento</th>
              {mostrarDetalle && <th className="px-4 py-3 text-left font-medium text-gray-600">Detalle</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cargas.map((c) => {
              const unidadVehiculo = (c as any).vehiculos?.numero_economico ?? '—'
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-gray-700">{formatoFechaHora(c.fecha_hora)}</td>
                  <td className="px-4 py-3 text-gray-700">{unidadVehiculo}</td>
                  <td className="px-4 py-3 text-gray-700">{c.folio_ticket ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{formatoDistancia(c.kilometraje, unidad, 0)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatoVolumen(c.litros_cargados, unidad, 2)}</td>
                  <td className="px-4 py-3 text-gray-700">${c.total_pagado.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.rendimiento_km_l ? formatoRendimiento(c.rendimiento_km_l, unidad) : '—'}
                  </td>
                  {mostrarDetalle && (
                    <td className="px-4 py-3">
                      <Link href={`/cargas/${c.id}`} className="font-medium text-blue-600 hover:underline">
                        Ver
                      </Link>
                    </td>
                  )}
                </tr>
              )
            })}
            {cargas.length === 0 && (
              <tr>
                <td colSpan={mostrarDetalle ? 8 : 7} className="px-4 py-6 text-center text-gray-500">
                  {hayFiltros ? 'No se encontraron cargas con esos filtros.' : 'Aún no hay cargas registradas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}