import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEmpresaById, getUsoEmpresa } from '@/repositories/empresa.repository'
import { getUsuarios } from '@/repositories/usuario.repository'
import { getModulosEmpresa } from '@/repositories/permiso.repository'
import { ModuloEmpresaCheckbox } from './checkbox-modulo'
import type { ModuloVista } from '@/lib/auth/permissions'
import { actualizarLimitesAction } from './actions'

const MODULOS: { valor: ModuloVista; label: string }[] = [
  { valor: 'dashboard', label: 'Dashboard' },
  { valor: 'vehiculos', label: 'Flota' },
  { valor: 'operadores', label: 'Operadores' },
  { valor: 'mantenimientos', label: 'Mantenimientos' },
  { valor: 'cargas', label: 'Cargas' },
  { valor: 'reportes', label: 'Reportes' },
  { valor: 'alertas', label: 'Alertas' },
  { valor: 'reportes_unidad', label: 'Reportes de unidad' },
  { valor: 'pases_salida', label: 'Pases de salida' },
  { valor: 'usuarios', label: 'Usuarios' },
  { valor: 'configuracion', label: 'Configuración' },
]

export default async function DetalleEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const empresa = await getEmpresaById(supabase, id)
  const uso = await getUsoEmpresa(supabase, id)
  const usuarios = await getUsuarios(supabase, id)
  const modulosGuardados = await getModulosEmpresa(supabase, id)

  const mapaModulos = new Map<string, boolean>()
  for (const m of modulosGuardados) {
    mapaModulos.set(m.modulo, m.activo)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/desarrollador" className="text-xs font-medium text-brand-dark hover:underline">
          ← Volver a Empresas
        </Link>
        <h1 className="text-lg font-semibold text-slate-900 mt-1">{empresa.nombre}</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Límites de uso</h2>
        <form action={actualizarLimitesAction} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="empresa_id" value={empresa.id} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Usuarios ({uso.usuarios} en uso)
            </label>
            <input
              name="limite_usuarios"
              type="number"
              min="0"
              defaultValue={empresa.limite_usuarios ?? ''}
              placeholder="Sin límite"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Vehículos ({uso.vehiculos} en uso)
            </label>
            <input
              name="limite_vehiculos"
              type="number"
              min="0"
              defaultValue={empresa.limite_vehiculos ?? ''}
              placeholder="Sin límite"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <button type="submit" className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors">
              Guardar límites
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Módulos activos</h2>
        <p className="text-xs text-slate-500">Desmarca un módulo para quitárselo a toda la empresa, sin importar el rol.</p>
        <div className="grid grid-cols-2 gap-2">
          {MODULOS.map((m) => (
            <label key={m.valor} className="flex items-center gap-2 text-sm text-slate-700">
              <ModuloEmpresaCheckbox
                empresaId={empresa.id}
                modulo={m.valor}
                activo={mapaModulos.get(m.valor) ?? true}
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-sm font-semibold text-slate-900">Usuarios</h2>
          <Link href={`/desarrollador/${empresa.id}/usuarios/nuevo`} className="text-xs font-medium text-brand-dark hover:underline">
            + Nuevo usuario
          </Link>
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-6 py-3">Nombre</th>
              <th className="text-left px-6 py-3">Correo</th>
              <th className="text-left px-6 py-3">Rol</th>
              <th className="text-left px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sin usuarios todavía.</td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{u.nombre_completo}</td>
                  <td className="px-6 py-3 text-slate-600">{(u as any).email ?? '—'}</td>
                  <td className="px-6 py-3 text-slate-600 capitalize">{u.rol}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}