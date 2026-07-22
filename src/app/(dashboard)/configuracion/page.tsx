import { getMatrizPermisos } from '@/repositories/permiso.repository'
import { createClient } from '@/lib/supabase/server'
import { CheckboxPermiso } from './checkbox-permiso'
import type { RolUsuario } from '@/lib/supabase/types'
import type { ModuloVista } from '@/lib/auth/permissions'

const ROLES: RolUsuario[] = ['administrador', 'supervisor', 'capturista', 'operador', 'contabilidad', 'auditor']

const MODULOS: { valor: ModuloVista; label: string }[] = [
  { valor: 'dashboard', label: 'Dashboard' },
  { valor: 'vehiculos', label: 'Flota' },
  { valor: 'operadores', label: 'Operadores' },
  { valor: 'mantenimientos', label: 'Mantenimientos' },
  { valor: 'cargas', label: 'Cargas' },
  { valor: 'reportes', label: 'Reportes' },
  { valor: 'alertas', label: 'Alertas' },
  { valor: 'reportes_unidad', label: 'Reportes de unidad' },
  { valor: 'usuarios', label: 'Usuarios' },
  { valor: 'configuracion', label: 'Configuración' },
]

const ROL_LABEL: Record<RolUsuario, string> = {
  administrador: 'Administrador',
  supervisor: 'Supervisor',
  capturista: 'Capturista',
  operador: 'Operador',
  contabilidad: 'Contabilidad',
  auditor: 'Auditor',
}

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const permisos = await getMatrizPermisos(supabase)

  const mapa = new Map<string, boolean>()
  for (const p of permisos) {
    mapa.set(`${p.rol}:${p.modulo}`, p.puede_ver)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Permisos por rol</h1>
        <p className="text-sm text-slate-500 mt-1">
          Marca qué apartados puede ver cada rol en el menú. El Administrador siempre ve todo.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Apartado</th>
              {ROLES.map((rol) => (
                <th key={rol} className="text-center px-4 py-3">{ROL_LABEL[rol]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MODULOS.map((modulo) => (
              <tr key={modulo.valor}>
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{modulo.label}</td>
                {ROLES.map((rol) => (
                  <td key={rol} className="text-center px-4 py-3">
                    {rol === 'administrador' ? (
                      <input type="checkbox" checked disabled className="w-4 h-4" />
                    ) : (
                      <CheckboxPermiso
                        rol={rol}
                        modulo={modulo.valor}
                        puedeVer={mapa.get(`${rol}:${modulo.valor}`) ?? false}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}