'use client'

import { useTransition } from 'react'
import { cambiarPermisoVistaAction } from './actions'
import type { RolUsuario } from '@/lib/supabase/types'
import type { ModuloVista } from '@/lib/auth/permissions'

export function CheckboxPermiso({
  rol,
  modulo,
  puedeVer,
}: {
  rol: RolUsuario
  modulo: ModuloVista
  puedeVer: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <input
      type="checkbox"
      defaultChecked={puedeVer}
      disabled={pending}
      onChange={(e) => {
        const nuevoValor = e.target.checked
        startTransition(() => {
          cambiarPermisoVistaAction(rol, modulo, nuevoValor)
        })
      }}
      className="w-4 h-4"
    />
  )
}