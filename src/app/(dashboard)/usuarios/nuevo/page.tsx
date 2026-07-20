import { createClient } from '@/lib/supabase/server'
import { getUsuarioActual } from '@/lib/auth/session'
import { crearUsuarioAction } from './actions'

export default async function NuevoUsuarioPage() {
  const usuarioActual = await getUsuarioActual()
  const supabase = await createClient()

  const { data: terminales } = await supabase
    .from('terminales')
    .select('id, nombre')
    .eq('empresa_id', usuarioActual!.empresaId)

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Nuevo usuario</h1>

      <form action={crearUsuarioAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Campo label="Nombre completo" name="nombre_completo" required />
        <Campo label="Correo" name="email" type="email" required />
        <Campo label="Contraseña temporal" name="password" type="password" required />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
          <select name="rol" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="capturista">Capturista</option>
            <option value="supervisor">Supervisor</option>
            <option value="operador">Operador</option>
            <option value="contabilidad">Contabilidad</option>
            <option value="auditor">Auditor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Terminal</label>
          <select name="terminal_id" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Selecciona...</option>
            {(terminales ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Crear usuario
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