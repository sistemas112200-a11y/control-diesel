'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vehiculos', label: 'Flota' },
  { href: '/operadores', label: 'Operadores' },
  { href: '/cargas', label: 'Cargas' },
  { href: '/reportes', label: 'Reportes' },
  { href: '/alertas', label: 'Alertas' },
  { href: '/usuarios', label: 'Usuarios' },
  { href: '/configuracion', label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 bg-sidebar min-h-screen flex flex-col py-4">
      <div className="px-4 mb-6">
        <span className="text-white font-semibold text-sm">Control de Diésel</span>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
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