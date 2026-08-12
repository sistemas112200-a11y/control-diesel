import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { createClient } from '@/lib/supabase/server'
import { crearLlantaAction } from './actions'

const OPCIONES_POSICION = [
  { value: '', label: 'Sin posición (bodega / refacción)' },
  { value: 'delantera_izquierda', label: 'Delantera izquierda' },
  { value: 'delantera_derecha', label: 'Delantera derecha' },
  { value: 'trasera_izquierda_interna', label: 'Trasera izquierda interna' },
  { value: 'trasera_izquierda_externa', label: 'Trasera izquierda externa' },
  { value: 'trasera_derecha_interna', label: 'Trasera derecha interna' },
  { value: 'trasera_derecha_externa', label: 'Trasera derecha externa' },
  { value: 'refaccion', label: 'Refacción' },
  { value: 'otra', label: 'Otra' },
]

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

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-sm text-slate-500">{vehiculo.numero_economico}</p>
        <h1 className="text-lg font-semibold text-slate-900">Nueva llanta</h1>
      </div>

      <form action={crearLlantaAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="vehiculo_id" value={vehiculoId} />

        <Campo label="Marca" name="marca" required />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Modelo" name="modelo" />
          <Campo label="Medida" name="medida" placeholder="Ej. 295/80R22.5" />
        </div>
        <Campo label="Número de serie" name="numero_serie" />

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
            {OPCIONES_POSICION.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Fecha de instalación" name="fecha_instalacion" type="date" />
          <Campo label="Km de instalación" name="km_instalacion" type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Profundidad original (mm)" name="profundidad_original_mm" type="number" defaultValue="18" />
          <Campo label="Profundidad mínima (mm)" name="profundidad_minima_mm" type="number" defaultValue="3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo label="Presión recomendada (psi)" name="presion_recomendada_psi" type="number" />
          <Campo label="Costo" name="costo" type="number" step="0.01" />
        </div>

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
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  step?: string
  defaultValue?: string
  placeholder?: string
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
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )
}