'use client'

import { useTransition } from 'react'
import type { EstadoReporte } from '@/lib/supabase/types'
import { ESTADO_LABEL } from '@/lib/ordenes-trabajo'
import { moverOrdenAction } from '@/app/(dashboard)/reportes-unidad/actions'

export function OrdenMover({ id, opciones }: { id: string; opciones: EstadoReporte[] }) {
  const [pending, startTransition] = useTransition()

  if (opciones.length === 0) return null

  return (
    <select
      defaultValue=""
      disabled={pending}
      onChange={(e) => {
        const valor = e.target.value as EstadoReporte
        if (!valor) return
        startTransition(() => {
          moverOrdenAction(id, valor)
        })
        e.target.value = ''
      }}
      className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
    >
      <option value="">Mover a...</option>
      {opciones.map((op) => (
        <option key={op} value={op}>{ESTADO_LABEL[op]}</option>
      ))}
    </select>
  )
}