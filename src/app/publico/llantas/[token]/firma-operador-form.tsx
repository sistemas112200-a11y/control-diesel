'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FirmaPad } from '@/components/ui/firma-pad'
import { guardarFirmaPublicaAction } from './actions'

export function FirmaOperadorForm({ token }: { token: string }) {
  const router = useRouter()
  const [pendiente, iniciarTransicion] = useTransition()
  const [error, setError] = useState('')

  function enviar(formData: FormData) {
    setError('')
    iniciarTransicion(async () => {
      const resultado = await guardarFirmaPublicaAction(token, formData)
      if (!resultado.ok) {
        setError(resultado.mensaje)
        return
      }
      router.refresh()
    })
  }

  return (
    <form action={enviar} className="mt-4 rounded-md border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-900 mb-2">Firma de recibido</p>
      <input
        name="firmado_por"
        placeholder="Nombre del operador"
        required
        className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <FirmaPad name="firma_url" />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pendiente}
        className="mt-3 rounded-md bg-brand-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pendiente ? 'Guardando...' : 'Guardar firma'}
      </button>
    </form>
  )
}