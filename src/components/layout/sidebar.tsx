'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { puedeVer, type ModuloVista } from '@/lib/auth/permissions'
import type { RolUsuario } from '@/lib/supabase/types'

const NAV_ITEMS: { href: string; label: string; modulo: ModuloVista }[] = [
  { href: '/dashboard', label: 'Dashboard', modulo: 'dashboard' },
  { href: '/vehiculos', label: 'Flota', modulo: 'vehiculos' },
  { href: '/operadores', label: 'Operadores', modulo: 'operadores' },
  { href: '/cargas', label: 'Cargas', modulo: 'cargas' },
  { href: '/reportes', label: 'Reportes', modulo: 'reportes' },
  { href: '/alertas', label: 'Alertas', modulo: 'alertas' },
  { href: '/usuarios', label: 'Usuarios', modulo: 'usuarios' },
  { href: '/configuracion', label: 'Configuración', modulo: 'configuracion' },
]

export function Sidebar({ rol }: { rol: RolUsuario }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => puedeVer(rol, item.modulo))

  return (
    <aside className="w-56 shrink-0 bg-sidebar min-h-screen flex flex-col py-4">
      <div className="px-4 mb-6">
        <span className="text-white font-semibold text-sm">Control de Diésel</span>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {items.map((item) => {
          const activo = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                activo
                  ? 'bg-sidebar-hover text-brand font-medium'
                  : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}