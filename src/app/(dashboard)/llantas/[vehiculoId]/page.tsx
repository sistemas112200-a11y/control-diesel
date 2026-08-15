import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getLlantas, type Llanta } from '@/repositories/llanta.repository'
import { generarEjes, etiquetaPosicion } from '@/lib/llantas-config'
import { BotonGenerarLink } from './boton-generar-link'

type EstadoVisual = 'vacio' | 'bien' | 'atencion' | 'critico'

function estadoVisualLlanta(llanta: Llanta | undefined): EstadoVisual {
  if (!llanta) return 'vacio'
  if (llanta.profundidad_actual_mm == null) return 'atencion'
  if (llanta.profundidad_actual_mm <= llanta.profundidad_minima_mm) return 'critico'
  if (llanta.presion_actual_psi != null && llanta.presion_recomendada_psi) {
    const diferencia = Math.abs(llanta.presion_actual_psi - llanta.presion_recomendada_psi) / llanta.presion_recomendada_psi
    if (diferencia > 0.15) return 'atencion'
  }
  const margen = llanta.profundidad_actual_mm - llanta.profundidad_minima_mm
  if (margen <= 2) return 'atencion'
  return 'bien'
}

const COLOR_ESTADO: Record<EstadoVisual, string> = {
  vacio: 'bg-slate-200 border-slate-300 text-slate-500',
  bien: 'bg-green-100 border-green-400 text-green-700',
  atencion: 'bg-amber-100 border-amber-400 text-amber-700',
  critico: 'bg-red-100 border-red-400 text-red-700',
}

const LABEL_ESTADO: Record<EstadoVisual, string> = {
  vacio: 'Sin registrar',
  bien: 'Bien',
  atencion: 'Revisar',
  critico: 'Crítico',
}

export default async function LlantasVehiculoPage({
  params,
}: {
  params: Promise<{ vehiculoId: string }>
}) {
  const { vehiculoId } = await params
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, vehiculoId)
  const llantas = await getLlantas(supabase, { vehiculoId, estado: 'en_uso' })

  const porPosicion = new Map<string, Llanta>()
  for (const l of llantas) {
    if (l.posicion) porPosicion.set(l.posicion, l)
  }
  const extras = llantas.filter((l) => l.posicion === 'refaccion' || l.posicion === 'otra')

  const ejes = generarEjes(vehiculo.numero_llantas, vehiculo.tiene_eje_delantero)

  // Numeración secuencial de posiciones en el orden en que se dibujan (1, 2, 3...)
  const posicionesOrdenadas = ejes.flatMap((eje) => eje.posiciones)
  const numeroPorPosicion = new Map<string, number>()
  posicionesOrdenadas.forEach((p, i) => numeroPorPosicion.set(p.posicion, i + 1))

  function Llantita({ posicion, etiqueta }: { posicion: string; etiqueta: string }) {
    const llanta = porPosicion.get(posicion)
    const estado = estadoVisualLlanta(llanta)
    const numero = numeroPorPosicion.get(posicion)
    const href = llanta
      ? `/llantas/${vehiculoId}/${llanta.id}`
      : `/llantas/${vehiculoId}/nueva?posicion=${posicion}`

    return (
      <Link
        href={href}
        className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 text-center px-1 transition-transform hover:scale-105 ${COLOR_ESTADO[estado]}`}
        title={etiqueta}
      >
        {numero != null && (
          <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow">
            {numero}
          </span>
        )}
        <span className="text-lg">🛞</span>
        <span className="text-[10px] font-medium leading-tight mt-0.5">
          {llanta?.profundidad_actual_mm != null ? `${llanta.profundidad_actual_mm} mm` : LABEL_ESTADO[estado]}
        </span>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/llantas" className="text-xs font-medium text-brand-dark hover:underline">
            ← Todas las unidades
          </Link>
          <h1 className="text-lg font-semibold text-slate-900 mt-1">
            Llantas de {vehiculo.numero_economico}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <BotonGenerarLink vehiculoId={vehiculoId} />
          <Link
            href={`/llantas/${vehiculoId}/historial`}
            className="text-xs font-medium text-brand-dark hover:underline"
          >
            Historial de firmas
          </Link>
          <Link
            href={`/vehiculos/${vehiculoId}/editar`}
            className="text-xs font-medium text-brand-dark hover:underline"
          >
            Cambiar configuración de ejes
          </Link>
          <Link
            href={`/llantas/${vehiculoId}/nueva`}
            className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            + Nueva llanta
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="max-w-sm mx-auto flex flex-col items-center gap-6">
          {ejes.map((eje) => {
            if (eje.posiciones.length === 4) {
              const [extIzq, intIzq, intDer, extDer] = eje.posiciones
              return (
                <div key={`${eje.tipo}-${eje.numero}`} className="flex items-center gap-4">
                  <Llantita posicion={extIzq.posicion} etiqueta={extIzq.etiqueta} />
                  <Llantita posicion={intIzq.posicion} etiqueta={intIzq.etiqueta} />
                  <div className="w-6" />
                  <Llantita posicion={intDer.posicion} etiqueta={intDer.etiqueta} />
                  <Llantita posicion={extDer.posicion} etiqueta={extDer.etiqueta} />
                </div>
              )
            }
            const [izq, der] = eje.posiciones
            return (
              <div key={`${eje.tipo}-${eje.numero}`} className="flex items-center gap-16">
                <Llantita posicion={izq.posicion} etiqueta={izq.etiqueta} />
                <Llantita posicion={der.posicion} etiqueta={der.etiqueta} />
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-400" /> Bien</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400" /> Revisar</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-400" /> Crítico</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" /> Sin registrar</span>
        </div>
      </div>

      {extras.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Refacción y otras</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Posición</th>
                <th className="text-left px-4 py-3">Marca</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {extras.map((l) => {
                const estado = estadoVisualLlanta(l)
                return (
                  <tr key={l.id}>
                    <td className="px-4 py-3 text-slate-600">{etiquetaPosicion(l.posicion)}</td>
                    <td className="px-4 py-3 text-slate-600">{l.marca}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${COLOR_ESTADO[estado]}`}>
                        {LABEL_ESTADO[estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/llantas/${vehiculoId}/${l.id}`} className="text-xs font-medium text-brand-dark hover:underline">
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}