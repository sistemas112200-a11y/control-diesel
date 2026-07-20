'use client'

export function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 transition-colors"
    >
      Imprimir
    </button>
  )
}