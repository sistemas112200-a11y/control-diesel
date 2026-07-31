'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors print:hidden"
    >
      Imprimir etiqueta
    </button>
  )
}