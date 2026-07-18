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
        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center">
          {iniciales}
        </div>
        <div className="text-sm">
          <p className="font-medium text-slate-900 leading-tight">{nombreCompleto}</p>
          <p className="text-slate-500 text-xs leading-tight capitalize">{rol}</p>
        </div>
      </div>
    </header>
  )
}