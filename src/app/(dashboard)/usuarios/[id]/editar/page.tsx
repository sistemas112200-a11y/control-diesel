import { createClient } from '@/lib/supabase/server'
import { getUsuarioById } from '@/repositories/usuario.repository'
import { cambiarRolUsuarioAction, restablecerContrasenaAction } from '../../actions'

const ROLES: { value: string; label: string }[] = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'capturista', label: 'Capturista' },
  { value: 'operador', label: 'Operador' },
  { value: 'contabilidad', label: 'Contabilidad' },
  { value: 'auditor', label: 'Auditor' },
]

export default async function EditarUsuarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const usuario = await getUsuarioById(supabase, id)

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Editar usuario</h1>
        <p className="text-sm text-slate-500 mt-1">
          {usuario.nombre_completo} — {(usuario as any).email ?? ''}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Rol</h2>
        <form action={cambiarRolUsuarioAction} className="flex items-end gap-3">
          <input type="hidden" name="id" value={usuario.id} />
          <div className="flex-1">
            <select
              name="rol"
              defaultValue={usuario.rol}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
            Guardar rol
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Restablecer contraseña</h2>
        <p className="text-xs text-slate-500">
          Escribe una contraseña temporal y compártela con el usuario.
        </p>
        <form action={restablecerContrasenaAction} className="flex items-end gap-3">
          <input type="hidden" name="id" value={usuario.id} />
          <div className="flex-1">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              minLength={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
            Restablecer
          </button>
        </form>
      </div>
    </div>
  )
}