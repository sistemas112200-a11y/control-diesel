import Link from 'next/link'
import { getUsuarioActual } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { ETIQUETA_VOLUMEN, ETIQUETA_RENDIMIENTO } from '@/lib/unidades'
import { crearVehiculoAction } from './actions'

export default async function NuevoVehiculoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const usuario = await getUsuarioActual()
  const supabase = await createClient()
  const empresa = await getEmpresaById(supabase, usuario!.empresaId)
  const unidad = empresa.unidad_medida

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/vehiculos" className="text-xs font-medium text-brand-dark hover:underline">
          ← Vehículos
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">Nuevo vehículo</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={crearVehiculoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Número económico *</label>
            <input
              type="text"
              name="numero_economico"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Placas</label>
            <input
              type="text"
              name="placas"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Marca</label>
            <input
              type="text"
              name="marca"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Modelo</label>
            <input
              type="text"
              name="modelo"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Año</label>
          <input
            type="number"
            name="anio"
            className="w-full max-w-[160px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Capacidad tanque ({ETIQUETA_VOLUMEN[unidad]}) *
            </label>
            <input
              type="number"
              step="0.01"
              name="capacidad_tanque1_litros"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Rendimiento esperado ({ETIQUETA_RENDIMIENTO[unidad]}) *
            </label>
            <input
              type="number"
              step="0.01"
              name="rendimiento_esperado_km_l"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Número de llantas</label>
            <input
              type="number"
              name="numero_llantas"
              defaultValue="6"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="tiene_eje_delantero"
                defaultChecked
                className="rounded border-slate-300"
              />
              Tiene eje delantero
            </label>
            <p className="text-[11px] text-slate-400">
              Desmárcalo para dollys (sin eje delantero propio).
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/vehiculos"
            className="rounded-md border border-slate-300 text-slate-600 text-sm font-medium px-4 py-2 hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}