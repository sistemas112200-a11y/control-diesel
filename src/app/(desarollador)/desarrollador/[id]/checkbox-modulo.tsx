'use client'

import { useTransition } from 'react'
import { actualizarModuloEmpresaAction } from './actions'
import type { ModuloVista } from '@/lib/auth/permissions'

export function ModuloEmpresaCheckbox({
  empresaId,
  modulo,
  activo,
}: {
  empresaId: string
  modulo: ModuloVista
  activo: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <input
      type="checkbox"
      defaultChecked={activo}
      disabled={pending}
      onChange={(e) => {
        const nuevoValor = e.target.checked
        startTransition(() => {
          actualizarModuloEmpresaAction(empresaId, modulo, nuevoValor)
        })
      }}
      className="w-4 h-4"
    />
  )
}