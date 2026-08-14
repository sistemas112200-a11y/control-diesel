import { createClient } from '@/lib/supabase/server'
import { getResumenDiesel } from '@/repositories/reporte-diesel.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { GraficaBarras } from '@/components/ui/grafica-barras'
import { TablaUnidadesDiesel } from '@/components/ui/tabla-unidades-diesel'
import { TablaOperadoresDiesel } from '@/components/ui/tabla-operadores-diesel'
import { formatoVolumen, formatoRendimiento } from '@/lib/unidades'

const MESES_LABEL: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

function formatearMes(mesKey: string) {
  const [anio, mes] = mesKey.split('-')
  return `${MESES_LABEL[mes] ?? mes} ${anio.slice(2)}`
}

function formatoDinero(v: number) {
  return `$${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export default async function DashboardDieselPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}) {
  const { desde, hasta } = await searchParams
  const rangoActivo = Boolean(desde || hasta)

  const supabase = await createClient()
  const usuario = await getUsuarioActual()
  const empresa = await getEmpresaById(supabase, usuario!.empresaId)
  const unidad = empresa.unidad_medida

  const resumen = await getResumenDiesel(supabase, rangoActivo ? { desde, hasta } : { meses: 6 })

  const datosLitrosMes = resumen.porMes.map((m) => ({ etiqueta: formatearMes(m.mes), valor: m.litros }))
  const datosGastoMes = resumen.porMes.map((m) => ({ etiqueta: formatearMes(m.mes), valor: m.gasto }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard - Diésel</h1>
        <p className="text-sm text-slate-500 mt-1">
          {rangoActivo
            ? `Resumen del ${desde ?? '...'} al ${hasta ?? 'hoy'}.`
            : 'Resumen de los últimos 6 meses, para presentar a dirección.'}
        </p>
      </div>

      <form className="flex items-end gap-3 bg-white rounded-xl border border-slate-200 p-4">
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
        {rangoActivo && (
          
            href="/dashboard-diesel"
            className="text-sm font-medium text-slate-500 hover:underline px-2 py-2"
          >
            Quitar filtro (ver últimos 6 meses)
          </a>
        )}
      </form>

      <div className="grid grid-cols-3 gap-4">
        <TarjetaKpi titulo={unidad === 'imperial' ? 'Galones cargados' : 'Litros cargados'} valor={formatoVolumen(resumen.litrosTotal, unidad, 0)} />
        <TarjetaKpi titulo="Gasto total" valor={formatoDinero(resumen.gastoTotal)} />
        <TarjetaKpi
          titulo="Rendimiento promedio"
          valor={resumen.rendimientoPromedio != null ? formatoRendimiento(resumen.rendimientoPromedio, unidad) : '—'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">{unidad === 'imperial' ? 'Galones por mes' : 'Litros por mes'}</h2>
          <GraficaBarras datos={datosLitrosMes} formatoValor={(v) => formatoVolumen(v, unidad, 0)} color="#378add" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Gasto por mes</h2>
          <GraficaBarras datos={datosGastoMes} formatoValor={formatoDinero} color="#185fa5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-6 pt-6 pb-2">
            {unidad === 'imperial' ? 'Galones y gasto por unidad' : 'Litros y gasto por unidad'}
          </h2>
          <TablaUnidadesDiesel datos={resumen.porUnidad} unidadMedida={unidad} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-6 pt-6 pb-2">Rendimiento por operador</h2>
          <TablaOperadoresDiesel datos={resumen.porOperador} unidadMedida={unidad} />
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
                  <span className="font-medium text-green-700">{formatoRendimiento(u.rendimientoPromedio!, unidad)}</span>
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
                  <span className="font-medium text-green-700">{formatoRendimiento(o.rendimientoPromedio!, unidad)}</span>
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