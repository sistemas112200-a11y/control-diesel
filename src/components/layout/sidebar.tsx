'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { puedeVer, type ModuloVista } from '@/lib/auth/permissions'
import type { RolUsuario } from '@/lib/supabase/types'

const ITEMS_PRINCIPALES: { href: string; label: string; modulo: ModuloVista }[] = [
  { href: '/dashboard', label: 'Dashboard', modulo: 'dashboard' },
  { href: '/vehiculos', label: 'Flota', modulo: 'vehiculos' },
  { href: '/operadores', label: 'Operadores', modulo: 'operadores' },
]

const ITEMS_DIESEL: { href: string; label: string; modulo: ModuloVista }[] = [
  { href: '/cargas', label: 'Cargas', modulo: 'cargas' },
  { href: '/reportes', label: 'Reportes', modulo: 'reportes' },
  { href: '/alertas', label: 'Alertas', modulo: 'alertas' },
]

const ITEMS_FINALES: { href: string; label: string; modulo: ModuloVista }[] = [
  { href: '/usuarios', label: 'Usuarios', modulo: 'usuarios' },
  { href: '/configuracion', label: 'Configuración', modulo: 'configuracion' },
]

export function Sidebar({ rol }: { rol: RolUsuario }) {
  const pathname = usePathname()

  const itemsPrincipales = ITEMS_PRINCIPALES.filter((item) => puedeVer(rol, item.modulo))
  const itemsDiesel = ITEMS_DIESEL.filter((item) => puedeVer(rol, item.modulo))
  const itemsFinales = ITEMS_FINALES.filter((item) => puedeVer(rol, item.modulo))

  const dieselActivo = itemsDiesel.some((item) => pathname.startsWith(item.href))
  const [abierto, setAbierto] = useState(dieselActivo)

  useEffect(() => {
    if (dieselActivo) setAbierto(true)
  }, [dieselActivo])

  function renderLink(item: { href: string; label: string }) {
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
  }

  return (
    <aside className="w-56 shrink-0 bg-sidebar min-h-screen flex flex-col py-4">
      <div className="px-4 mb-6">
        <span className="text-white font-semibold text-sm">Control de Diésel</span>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {itemsPrincipales.map(renderLink)}

        {itemsDiesel.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                dieselActivo ? 'text-white font-medium' : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <span>Diésel</span>
              <span className={`text-xs transition-transform ${abierto ? 'rotate-90' : ''}`}>›</span>
            </button>
            {abierto && (
              <div className="ml-3 mt-1 space-y-1 border-l border-sidebar-hover pl-2">
                {itemsDiesel.map(renderLink)}
              </div>
            )}
          </div>
        )}

        {itemsFinales.map(renderLink)}
      </nav>
    </aside>
  )
}