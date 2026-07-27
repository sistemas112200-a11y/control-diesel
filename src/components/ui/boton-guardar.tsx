'use client'

import { useFormStatus } from 'react-dom'

export function BotonGuardar({ texto = 'Guardar' }: { texto?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 transition-colors"
    >
      {pending ? 'Guardando...' : texto}
    </button>
  )
}