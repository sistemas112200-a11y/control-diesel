import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAvisosActivosParaEmpresa } from '@/repositories/aviso.repository'
import { BannerAvisos } from '@/components/ui/banner-avisos'

function inicioDeHoy() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function inicioDeMes() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function claseComparacion(real: number | null, esperado: number): string {
  if (real == null) return 'text-slate-400'
  if (real >= esperado) return 'text-green-600 font-medium'
  if (real < esperado * 0.85) return 'text-red-600 font-medium'
  return 'text-amber-600 font-medium'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let avisos: Awaited<ReturnType<typeof getAvisosActivosParaEmpresa>> = []
  if (user) {
    const { data: perfil } = await supabase.from('usuarios').select('empresa_id').eq('id', user.id).single()
    if (perfil) {
      avisos = await getAvisosActivosParaEmpresa(supabase, perfil.empresa_id)
    }
  }

  const [{ data: cargasHoy }, { data: cargasMes }, { data: alertasActivas }, { data: vehiculos }, { data: rendimientosCargas }] = await Promise.all([
    supabase.from('cargas_combustible').select('litros_cargados').gte('fecha_hora', inicioDeHoy()).is('deleted_at', null),
    supabase.from('cargas_combustible').select('total_pagado, rendimiento_km_l').gte('fecha_hora', inicioDeMes()).is('deleted_at', null),
    supabase.from('alertas').select('id, severidad').eq('estado', 'nueva'),
    supabase.from('vehiculos').select('id, numero_economico, marca, modelo, rendimiento_esperado_km_l, estado').is('deleted_at', null),
    supabase.from('cargas_combustible').select('vehiculo_id, rendimiento_km_l').is('deleted_at', null).not('rendimiento_km_l', 'is', null),
  ])

  const litrosHoy = (cargasHoy ?? []).reduce((sum, c) => sum + c.litros_cargados, 0)
  const gastoMes = (cargasMes ?? []).reduce((sum, c) => sum + c.total_pagado, 0)
  const rendimientos = (cargasMes ?? []).map((c) => c.rendimiento_km_l).filter((r): r is number => r != null)
  const rendimientoPromedio = rendimientos.length
    ? rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length
    : 0
  const totalAlertas = alertasActivas?.length ?? 0

  const totalActivas = (vehiculos ?? []).filter((v) => v.estado === 'activo').length
  const totalTaller = (vehiculos ?? []).filter((v) => v.estado === 'taller').length
  const totalFueraServicio = (vehiculos ?? []).filter((v) => v.estado === 'baja').length

  const mapaRendimiento = new Map<string, number[]>()
  for (const c of rendimientosCargas ?? []) {
    if (c.rendimiento_km_l == null) continue
    const arr = mapaRendimiento.get(c.vehiculo_id) ?? []
    arr.push(c.rendimiento_km_l)
    mapaRendimiento.set(c.vehiculo_id, arr)
  }
  function rendimientoRealDe(vehiculoId: string): number | null {
    const arr = mapaRendimiento.get(vehiculoId)
    if (!arr || arr.length === 0) return null
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  return (
    <div className="space-y-6">
      <BannerAvisos avisos={avisos} />

      <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <TarjetaKpi label="Litros hoy" valor={`${litrosHoy.toFixed(0)} L`} />
        <TarjetaKpi label="Gasto del mes" valor={`$${gastoMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
        <TarjetaKpi label="Rendimiento promedio" valor={`${rendimientoPromedio.toFixed(2)} km/L`} />
        <TarjetaKpi label="Alertas activas" valor={String(totalAlertas)} destacado={totalAlertas > 0} />
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Estado de la flota</h2>
        <div className="grid grid-cols-3 gap-4">
          <TarjetaEstado href="/vehiculos?estado=activo" label="Activas" valor={totalActivas} color="green" />
          <TarjetaEstado href="/vehiculos?estado=taller" label="En taller" valor={totalTaller} color="amber" />
          <TarjetaEstado href="/vehiculos?estado=baja" label="Fuera de servicio" valor={totalFueraServicio} color="red" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-medium text-slate-700">Flota registrada</h2>
          <Link href="/vehiculos" className="text-xs text-brand-dark hover:underline font-medium">
            Ver todas
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Unidad</th>
              <th className="text-left px-4 py-2">Marca / Modelo</th>
              <th className="text-left px-4 py-2">Rendimiento esperado</th>
              <th className="text-left px-4 py-2">Rendimiento real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(vehiculos ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Aún no hay vehículos registrados.
                </td>
              </tr>
            ) : (
              vehiculos!.map((v) => {
                const real = rendimientoRealDe(v.id)
                return (
                  <tr key={v.id}>
                    <td className="px-4 py-2 font-medium text-slate-900">{v.numero_economico}</td>
                    <td className="px-4 py-2 text-slate-600">{v.marca} {v.modelo}</td>
                    <td className="px-4 py-2 text-slate-600">{v.rendimiento_esperado_km_l} km/L</td>
                    <td className={`px-4 py-2 ${claseComparacion(real, v.rendimiento_esperado_km_l)}`}>
                      {real != null ? `${real.toFixed(2)} km/L` : 'Sin datos'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TarjetaKpi({ label, valor, destacado = false }: { label: string; valor: string; destacado?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${destacado ? 'bg-red-50' : 'bg-white border border-slate-200'}`}>
      <p className={`text-xs mb-1 ${destacado ? 'text-red-600' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-xl font-semibold ${destacado ? 'text-red-700' : 'text-slate-900'}`}>{valor}</p>
    </div>
  )
}

const COLORES_ESTADO: Record<string, { fondo: string; texto: string; textoValor: string }> = {
  green: { fondo: 'bg-green-50 border-green-200', texto: 'text-green-600', textoValor: 'text-green-700' },
  amber: { fondo: 'bg-amber-50 border-amber-200', texto: 'text-amber-600', textoValor: 'text-amber-700' },
  red: { fondo: 'bg-red-50 border-red-200', texto: 'text-red-600', textoValor: 'text-red-700' },
}

function TarjetaEstado({ href, label, valor, color }: { href: string; label: string; valor: number; color: 'green' | 'amber' | 'red' }) {
  const c = COLORES_ESTADO[color]
  return (
    <Link href={href} className={`block rounded-xl border p-4 hover:opacity-80 transition-opacity ${c.fondo}`}>
      <p className={`text-xs mb-1 ${c.texto}`}>{label}</p>
      <p className={`text-2xl font-semibold ${c.textoValor}`}>{valor}</p>
    </Link>
  )
}