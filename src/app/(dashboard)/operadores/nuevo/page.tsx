import { crearOperadorAction } from './actions'

export default function NuevoOperadorPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo operador</h1>

      <form action={crearOperadorAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Campo label="Nombre completo" name="nombre_completo" required />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Número de licencia" name="licencia_numero" />
          <Campo label="Vigencia de licencia" name="licencia_vigencia" type="date" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Teléfono" name="telefono" />
          <Campo label="Fecha de ingreso" name="fecha_ingreso" type="date" />
        </div>
        <Campo label="Dirección" name="direccion" />

        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Guardar operador
        </button>
      </form>
    </div>
  )
}

function Campo({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
    </div>
  )
}