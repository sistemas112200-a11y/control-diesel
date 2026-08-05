'use client'

import { useTransition } from 'react'
import { quitarProductoAction } from '@/app/(dashboard)/almacen/salidas/[id]/actions'

export function QuitarProducto({ salidaId, detalleId }: { salidaId: string; detalleId: string }) {
  const [isPending, startTransition] = useTransition()

  function quitar() {
    startTransition(() => {
      quitarProductoAction(salidaId, detalleId)
    })
  }

  return (
    <button
      type="button"
      onClick={quitar}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      Quitar
    </button>
  )
}