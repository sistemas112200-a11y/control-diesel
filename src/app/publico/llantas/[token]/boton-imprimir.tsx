'use client'

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white"
    >
      Imprimir / Descargar PDF
    </button>
  )
}