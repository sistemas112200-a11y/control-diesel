import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { generarPosiciones } from '@/lib/llantas-config'
import { crearLlantaAction } from './actions'

export default async function NuevaLlantaPage({
  params,
  searchParams,
}: {
  params: Promise<{ vehiculoId: string }>
  searchParams: Promise<{ posicion?: string }>
}) {
  const { vehiculoId } = await params
  const { posicion } = await searchParams

  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, vehiculoId)

  const posiciones = [
    ...generarPosiciones(vehiculo.numero_llantas, vehiculo.tiene_eje_delantero),
    { posicion: 'refaccion', etiqueta: 'Refacción' },
    { posicion: 'otra', etiqueta: 'Otra' },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/llantas/${vehiculoId}`} className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver a llantas de {vehiculo.numero_economico}
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">Nueva llanta</h1>
      </div>

      <form action={crearLlantaAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="vehiculo_id" value={vehiculoId} />

        <div>
          <label htmlFor="posicion" className="block text-sm font-medium text-slate-700 mb-1">
            Posición
          </label>
          <select
            id="posicion"
            name="posicion"
            defaultValue={posicion ?? ''}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">Sin posición (almacén)</option>
            {posiciones.map((p) => (
              <option key={p.posicion} value={p.posicion}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Marca" name="marca" required />
          <Campo label="Modelo" name="modelo" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Medida" name="medida" placeholder="Ej. 295/75R22.5" />
          <Campo label="Número de serie" name="numero_serie" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Fecha de instalación" name="fecha_instalacion" type="date" />
          <Campo label="Km al instalar" name="km_instalacion" type="number" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Campo label="Profundidad original (mm)" name="profundidad_original_mm" type="number" step="0.1" defaultValue="18" />
          <Campo label="Profundidad mínima (mm)" name="profundidad_minima_mm" type="number" step="0.1" defaultValue="3" />
          <Campo label="Presión recomendada (psi)" name="presion_recomendada_psi" type="number" step="0.1" />
        </div>
        <Campo label="Costo" name="costo" type="number" step="0.01" />

        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Guardar llanta
        </button>
      </form>
    </div>
  )
}

function Campo({
  label,
  name,
  type = 'text',
  required = false,
  step,
  placeholder,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  step?: string
  placeholder?: string
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )
}