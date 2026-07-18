import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCargas } from '@/repositories/carga.repository'

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ alerta?: string }>
}) {
  const { alerta } = await searchParams
  const supabase = await createClient()
  const cargas = await getCargas(supabase)

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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Kilometraje</th>
              <th className="text-left px-4 py-3">Litros</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Rendimiento</th>
              <th className="text-left px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cargas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aún no hay cargas registradas.
                </td>
              </tr>
            ) : (
              cargas.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-slate-600">{new Date(c.fecha_hora).toLocaleString('es-MX')}</td>
                  <td className="px-4 py-3 text-slate-600">{c.kilometraje}</td>
                  <td className="px-4 py-3 text-slate-600">{c.litros_cargados} L</td>
                  <td className="px-4 py-3 text-slate-600">${c.total_pagado.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.rendimiento_km_l ? `${c.rendimiento_km_l.toFixed(2)} km/L` : '—'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cargas/${c.id}`} className="text-brand-dark hover:underline font-medium">
                      Ver fotos
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