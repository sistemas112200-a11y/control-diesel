'use client'

import { useState } from 'react'
import { generarEnlaceLlantasAction } from './actions'

export function BotonGenerarLink({ vehiculoId }: { vehiculoId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [error, setError] = useState('')

  async function generar() {
    setGenerando(true)
    setError('')
    try {
      const token = await generarEnlaceLlantasAction(vehiculoId)
      setLink(`${window.location.origin}/publico/llantas/${token}`)
      setCopiado(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el link')
    } finally {
      setGenerando(false)
    }
  }

  async function copiar() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiado(true)
  }

  if (link) {
    return (
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs w-56 bg-slate-50"
        />
        <button
          type="button"
          onClick={copiar}
          className="rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 transition-colors whitespace-nowrap"
        >
          {copiado ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={generar}
        disabled={generando}
        className="text-xs font-medium text-brand-dark hover:underline disabled:opacity-60"
      >
        {generando ? 'Generando...' : 'Generar link'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}