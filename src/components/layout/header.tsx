import { LogOut } from 'lucide-react'
import { logoutAction } from '@/lib/auth/actions'

interface HeaderProps {
  nombreCompleto: string
  rol: string
  terminalNombre: string
}

export function Header({ nombreCompleto, rol, terminalNombre }: HeaderProps) {
  const iniciales = nombreCompleto
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      <span className="text-sm text-slate-500">{terminalNombre}</span>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center">
          {iniciales}
        </div>
        <div className="text-sm">
          <p className="font-medium text-slate-900 leading-tight">{nombreCompleto}</p>
          <p className="text-slate-500 text-xs leading-tight capitalize">{rol}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="ml-2 flex items-center gap-1 rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  )
}