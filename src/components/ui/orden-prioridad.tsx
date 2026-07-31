'use client'

import { useTransition } from 'react'
import type { PrioridadOrden } from '@/lib/supabase/types'
import { PRIORIDAD_LABEL } from '@/lib/ordenes-trabajo'
import { cambiarPrioridadOrdenAction } from '@/app/(dashboard)/reportes-unidad/actions'

const OPCIONES: PrioridadOrden[] = ['alta', 'media', 'baja']

export function OrdenPrioridad({ id, prioridad }: { id: string; prioridad: PrioridadOrden }) {
  const [pending, startTransition] = useTransition()

  return (
    <select
      defaultValue={prioridad}
      disabled={pending}
      onChange={(e) => {
        const valor = e.target.value as PrioridadOrden
        startTransition(() => {
          cambiarPrioridadOrdenAction(id, valor)
        })
      }}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
    >
      {OPCIONES.map((op) => (
        <option key={op} value={op}>{PRIORIDAD_LABEL[op]}</option>
      ))}
    </select>
  )
}