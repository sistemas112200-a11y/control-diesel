'use client'

import { useTransition } from 'react'
import { asignarMecanicoAction } from '@/app/(dashboard)/reportes-unidad/[id]/actions'
import type { Mecanico } from '@/lib/supabase/types'

export function OrdenMecanico({
  id,
  mecanicoId,
  mecanicos,
}: {
  id: string
  mecanicoId: string | null
  mecanicos: Mecanico[]
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData()
    formData.set('id', id)
    formData.set('mecanico_id', e.target.value)
    startTransition(() => {
      asignarMecanicoAction(formData)
    })
  }

  return (
    <select
      defaultValue={mecanicoId ?? ''}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs disabled:opacity-50"
    >
      <option value="">Sin mecánico asignado</option>
      {mecanicos.map((m) => (
        <option key={m.id} value={m.id}>{m.nombre_completo}</option>
      ))}
    </select>
  )
}