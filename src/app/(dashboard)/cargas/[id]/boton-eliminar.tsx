'use client'

import { useState } from 'react'
import { eliminarCargaAction } from './actions'

export function BotonEliminarCarga({ id }: { id: string }) {
  const [eliminando, setEliminando] = useState(false)

  async function manejarClick() {
    if (!confirm('¿Eliminar esta carga? No se podrá deshacer desde la pantalla.')) return
    setEliminando(true)
    try {
      await eliminarCargaAction(id)
    } catch (err) {
      setEliminando(false)
      alert(err instanceof Error ? err.message : 'No se pudo eliminar la carga')
    }
  }

  return (
    <button
      type="button"
      onClick={manejarClick}
      disabled={eliminando}
      className="rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-sm font-medium px-4 py-2 transition-colors"
    >
      {eliminando ? 'Eliminando...' : 'Eliminar carga'}
    </button>
  )
}