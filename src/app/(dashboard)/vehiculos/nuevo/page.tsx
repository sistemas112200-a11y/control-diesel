import { crearVehiculoAction } from './actions'

export default function NuevoVehiculoPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo vehículo</h1>

      <form action={crearVehiculoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Campo label="Número económico" name="numero_economico" required />
        <Campo label="Placas" name="placas" />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Marca" name="marca" />
          <Campo label="Modelo" name="modelo" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Año" name="anio" type="number" />
          <Campo label="Capacidad tanque (L)" name="capacidad_tanque1_litros" type="number" required />
        </div>
        <Campo label="Rendimiento esperado (km/L)" name="rendimiento_esperado_km_l" type="number" step="0.1" required />

        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Guardar vehículo
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
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  step?: string
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
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )
}