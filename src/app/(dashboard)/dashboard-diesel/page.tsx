import { createClient } from '@/lib/supabase/server'
import { getResumenDiesel } from '@/repositories/reporte-diesel.repository'
import { GraficaBarras } from '@/components/ui/grafica-barras'
import { TablaUnidadesDiesel } from '@/components/ui/tabla-unidades-diesel'
import { TablaOperadoresDiesel } from '@/components/ui/tabla-operadores-diesel'

const MESES_LABEL: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

function formatearMes(mesKey: string) {
  const [anio, mes] = mesKey.split('-')
  return `${MESES_LABEL[mes] ?? mes} ${anio.slice(2)}`
}

function formatoLitros(v: number) {
  return `${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })} L`
}

function formatoDinero(v: number) {
  return `$${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export default async function DashboardDieselPage() {
  const supabase = await createClient()
  const resumen = await getResumenDiesel(supabase, { meses: 6 })

  const datosLitrosMes = resumen.porMes.map((m) => ({ etiqueta: formatearMes(m.mes), valor: m.litros }))
  const datosGastoMes = resumen.porMes.map((m) => ({ etiqueta: formatearMes(m.mes), valor: m.gasto }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard - Diésel</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen de los últimos 6 meses, para presentar a dirección.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TarjetaKpi titulo="Litros cargados" valor={formatoLitros(resumen.litrosTotal)} />
        <TarjetaKpi titulo="Gasto total" valor={formatoDinero(resumen.gastoTotal)} />
        <TarjetaKpi
          titulo="Rendimiento promedio"
          valor={resumen.rendimientoPromedio != null ? `${resumen.rendimientoPromedio.toFixed(2)} km/L` : '—'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Litros por mes</h2>
          <GraficaBarras datos={datosLitrosMes} formatoValor={formatoLitros} color="#378add" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Gasto por mes</h2>
          <GraficaBarras datos={datosGastoMes} formatoValor={formatoDinero} color="#185fa5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-6 pt-6 pb-2">Litros y gasto por unidad</h2>
          <TablaUnidadesDiesel datos={resumen.porUnidad} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-6 pt-6 pb-2">Rendimiento por operador</h2>
          <TablaOperadoresDiesel datos={resumen.porOperador} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Mejores unidades (rendimiento)</h2>
          {resumen.mejoresUnidades.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos suficientes.</p>
          ) : (
            <ol className="space-y-2">
              {resumen.mejoresUnidades.map((u, i) => (
                <li key={u.vehiculoId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{i + 1}. {u.unidad}</span>
                  <span className="font-medium text-green-700">{u.rendimientoPromedio!.toFixed(2)} km/L</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Mejores operadores (rendimiento)</h2>
          {resumen.mejoresOperadores.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos suficientes.</p>
          ) : (
            <ol className="space-y-2">
              {resumen.mejoresOperadores.map((o, i) => (
                <li key={o.operadorId} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{i + 1}. {o.operador}</span>
                  <span className="font-medium text-green-700">{o.rendimientoPromedio!.toFixed(2)} km/L</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

function TarjetaKpi({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{titulo}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{valor}</p>
    </div>
  )
}