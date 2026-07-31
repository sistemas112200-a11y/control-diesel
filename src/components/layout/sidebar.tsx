'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ModuloVista } from '@/lib/auth/permissions'

type Item = { href: string; label: string; modulo: ModuloVista }

const ITEMS_PRINCIPALES: Item[] = [
  { href: '/dashboard', label: 'Dashboard', modulo: 'dashboard' },
]

const ITEMS_ALTAS: Item[] = [
  { href: '/vehiculos', label: 'Flota', modulo: 'vehiculos' },
  { href: '/operadores', label: 'Operadores', modulo: 'operadores' },
]

const ITEMS_DIESEL: Item[] = [
  { href: '/cargas', label: 'Cargas', modulo: 'cargas' },
  { href: '/reportes', label: 'Reportes', modulo: 'reportes' },
  { href: '/alertas', label: 'Alertas', modulo: 'alertas' },
]

const ITEMS_TALLER: Item[] = [
  { href: '/mantenimientos', label: 'Mantenimientos', modulo: 'mantenimientos' },
  { href: '/reportes-unidad', label: 'Órdenes de trabajo', modulo: 'reportes_unidad' },
  { href: '/mecanicos', label: 'Mecánicos', modulo: 'mecanicos' },
]

const ITEMS_FINALES: Item[] = [
  { href: '/pases-salida', label: 'Pases de salida', modulo: 'pases_salida' },
  { href: '/usuarios', label: 'Usuarios', modulo: 'usuarios' },
  { href: '/configuracion', label: 'Configuración', modulo: 'configuracion' },
]

function Grupo({
  titulo,
  items,
  pathname,
  renderLink,
}: {
  titulo: string
  items: Item[]
  pathname: string
  renderLink: (item: Item) => ReactNode
}) {
  const activo = items.some((item) => pathname.startsWith(item.href))
  const [abierto, setAbierto] = useState(activo)

  useEffect(() => {
    if (activo) setAbierto(true)
  }, [activo])

  if (items.length === 0) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
          activo ? 'text-white font-medium' : 'text-slate-300 hover:bg-sidebar-hover hover:text-white'
        }`}
      >
        <span>{titulo}</span>
        <span className={`text-xs transition-transform ${abierto ? 'rotate-90' : ''}`}>›</span>
      </button>
      {abierto && (
        <div className="ml-3 mt-1 space-y-1 border-l border-sidebar-hover pl-2">
          {items.map(renderLink)}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ modulosVisibles }: { modulosVisibles: ModuloVista[] }) {
  const pathname = usePathname()
  const visibles = new Set(modulosVisibles)

  const itemsPrincipales = ITEMS_PRINCIPALES.filter((item) => visibles.has(item.modulo))
  const itemsAltas = ITEMS_ALTAS.filter((item) => visibles.has(item.modulo))
  const itemsDiesel = ITEMS_DIESEL.filter((item) => visibles.has(item.modulo))
  const itemsTaller = ITEMS_TALLER.filter((item) => visibles.has(item.modulo))
  const itemsFinales = ITEMS_FINALES.filter((item) => visibles.has(item.modulo))

  function renderLink(item: Item) {
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
      <div className="px-4 mb-6 flex items-center gap-2">
        <img src="/logo-icon.svg" alt="FlotaTotal" className="w-7 h-7 rounded-lg" />
        <span className="text-white font-semibold text-sm">FlotaTotal</span>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {itemsPrincipales.map(renderLink)}
        <Grupo titulo="Altas" items={itemsAltas} pathname={pathname} renderLink={renderLink} />
        <Grupo titulo="Diésel" items={itemsDiesel} pathname={pathname} renderLink={renderLink} />
        <Grupo titulo="Taller" items={itemsTaller} pathname={pathname} renderLink={renderLink} />
        {itemsFinales.map(renderLink)}
      </nav>
    </aside>
  )
}