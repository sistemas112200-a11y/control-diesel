import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUsuarios } from '@/repositories/usuario.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { cambiarEstadoUsuarioAction } from './actions'

const ROL_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  supervisor: 'Supervisor',
  capturista: 'Capturista',
  operador: 'Operador',
  contabilidad: 'Contabilidad',
  auditor: 'Auditor',
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const usuarioActual = await getUsuarioActual()
  const supabase = await createClient()
  const usuarios = await getUsuarios(supabase, usuarioActual!.empresaId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Usuarios</h1>
        <Link
          href="/usuarios/nuevo"
          className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Nuevo usuario
        </Link>
      </div>

      {ok === 'rol' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Rol actualizado correctamente.
        </div>
      )}
      {ok === 'password' && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
          Contraseña restablecida correctamente.
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Correo</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.nombre_completo}</td>
                <td className="px-4 py-3 text-slate-600">{(u as any).email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{ROL_LABEL[u.rol]}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/usuarios/${u.id}/editar`} className="text-xs font-medium text-brand-dark hover:underline">
                      Editar
                    </Link>
                    {u.id !== usuarioActual!.id && (
                      <form action={cambiarEstadoUsuarioAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="nuevo_estado" value={String(!u.activo)} />
                        <button type="submit" className="text-xs font-medium text-brand-dark hover:underline">
                          {u.activo ? 'Desactivar' : 'Reactivar'}
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}