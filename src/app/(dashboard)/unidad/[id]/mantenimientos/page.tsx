import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getMantenimientosPorVehiculo } from '@/repositories/mantenimiento.repository'

const TIPO_LABEL: Record<string, string> = {
  preventivo: 'Preventivo',
  correctivo: 'Correctivo',
}

export default async function MantenimientosUnidadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)
  const mantenimientos = await getMantenimientosPorVehiculo(supabase, id)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link href={`/unidad/${id}`} className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">Mantenimientos — {vehiculo.numero_economico}</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Kilometraje</th>
              <th className="text-left px-4 py-3">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mantenimientos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Esta unidad no tiene mantenimientos registrados.
                </td>
              </tr>
            ) : (
              mantenimientos.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(m.fecha + 'T00:00:00').toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3 text-slate-600">{TIPO_LABEL[m.tipo]}</td>
                  <td className="px-4 py-3 text-slate-600">{m.kilometraje} km</td>
                  <td className="px-4 py-3 text-slate-600">{m.descripcion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}