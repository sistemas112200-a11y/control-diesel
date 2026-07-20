'use client'

import { useState } from 'react'

export function TicketUploader() {
  const [leyendo, setLeyendo] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  async function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    setLeyendo(true)
    setMensaje(null)

    try {
      const formData = new FormData()
      formData.append('foto', archivo)

      const res = await fetch('/api/ocr/ticket', { method: 'POST', body: formData })
      const datos = await res.json()

      if (datos.litros) {
        const campo = document.querySelector<HTMLInputElement>('input[name="litros_cargados"]')
        if (campo) campo.value = datos.litros
      }
      if (datos.folio) {
        const campo = document.querySelector<HTMLInputElement>('input[name="folio_ticket"]')
        if (campo) campo.value = datos.folio
      }

      setMensaje(
        datos.litros || datos.folio
          ? 'Datos detectados y rellenados — revísalos antes de guardar.'
          : 'No se detectaron datos automáticamente, ingrésalos manualmente.'
      )
    } catch {
      setMensaje('No se pudo leer el ticket automáticamente, ingresa los datos manualmente.')
    } finally {
      setLeyendo(false)
    }
  }

  return (
    <div>
      <label htmlFor="foto_ticket" className="block text-sm font-medium text-slate-700 mb-1">
        Foto del ticket
      </label>
      <input
        id="foto_ticket"
        name="foto_ticket"
        type="file"
        accept="image/*"
        capture="environment"
        required
        onChange={manejarCambio}
        className="w-full text-sm"
      />
      {leyendo && <p className="text-xs text-slate-500 mt-1">Leyendo ticket...</p>}
      {mensaje && !leyendo && <p className="text-xs text-slate-500 mt-1">{mensaje}</p>}
    </div>
  )
}