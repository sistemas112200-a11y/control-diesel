import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getEnlacesFirmadosPorVehiculo } from '@/repositories/enlace-publico-llanta.repository'
import { formatoFechaHora } from '@/lib/fecha'

function nombreMes(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Chihuahua',
  })
}

export default async function HistorialFirmasLlantasPage({
  params,
}: {
  params: Promise<{ vehiculoId: string }>
}) {
  const { vehiculoId } = await params
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, vehiculoId)
  const enlaces = await getEnlacesFirmadosPorVehiculo(supabase, vehiculoId)

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/llantas/${vehiculoId}`} className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver a llantas de {vehiculo.numero_economico}
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">
          Historial de firmas — {vehiculo.numero_economico}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha firmada</th>
              <th className="text-left px-4 py-3">Mes</th>
              <th className="text-left px-4 py-3">Firmado por</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enlaces.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Todavía no hay reportes firmados para esta unidad.
                </td>
              </tr>
            ) : (
              enlaces.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-slate-600">{e.firmado_en ? formatoFechaHora(e.firmado_en) : '—'}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{e.firmado_en ? nombreMes(e.firmado_en) : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.firmado_por ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/publico/llantas/${e.token}`}
                      target="_blank"
                      className="text-xs font-medium text-brand-dark hover:underline"
                    >
                      Ver / imprimir PDF
                    </Link>
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