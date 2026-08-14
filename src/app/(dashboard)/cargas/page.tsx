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
  searchParams: Promise<{ alerta?: string; q?: string }>
}) {
  const { alerta, q } = await searchParams
  const supabase = await createClient()
  const usuarioActual = await getUsuarioActual()
  const empresa = await getEmpresaById(supabase, usuarioActual!.empresaId)
  const unidad = empresa.unidad_medida

  const todasLasCargas = await getCargas(supabase)
  const mostrarDetalle = usuarioActual ? puedeVerDetalleCargas(usuarioActual.rol) : false

  const cargas = q
    ? todasLasCargas.filter((c) => {
        const unidadVehiculo = (c as any).vehiculos?.numero_economico ?? ''
        const folio = c.folio_ticket ?? ''
        const termino = q.toLowerCase()
        return unidadVehiculo.toLowerCase().includes(termino) || folio.toLowerCase().includes(termino)
      })
    : todasLasCargas

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

      <form>
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Buscar por unidad o folio de ticket..."
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
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
                  {q ? `No se encontraron cargas para "${q}".` : 'Aún no hay cargas registradas.'}
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