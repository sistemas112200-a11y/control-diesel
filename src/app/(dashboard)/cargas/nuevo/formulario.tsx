'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { crearCargaAction } from './actions'
import { BuscadorUnidad } from '@/components/ui/buscador-unidad'

async function subirFoto(archivo: File | null, prefijo: string): Promise<string | undefined> {
  if (!archivo || archivo.size === 0) return undefined
  const supabase = createClient()
  const nombre = `${prefijo}-${Date.now()}-${archivo.name}`
  const { data, error } = await supabase.storage.from('cargas-foto').upload(nombre, archivo)
  if (error) throw new Error(`No se pudo subir la foto (${prefijo}): ${error.message}`)
  const { data: urlData } = supabase.storage.from('cargas-foto').getPublicUrl(data.path)
  return urlData.publicUrl
}

export function FormularioNuevaCarga({
  terminalId,
  vehiculoIdPreseleccionado,
  vehiculos,
  operadores,
}: {
  terminalId: string
  vehiculoIdPreseleccionado?: string
  vehiculos: { value: string; label: string }[]
  operadores: { value: string; label: string }[]
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const form = e.currentTarget
    const datos = new FormData(form)

    const vehiculoId = datos.get('vehiculo_id') as string
    const operadorId = datos.get('operador_id') as string

    if (!vehiculoId) {
      setError('Selecciona una unidad de la lista')
      return
    }
    if (!operadorId) {
      setError('Selecciona un operador de la lista')
      return
    }

    setSubiendo(true)

    try {
      const fotoTicket = datos.get('foto_ticket') as File
      const fotoKm = datos.get('foto_kilometraje') as File
      const fotoBomba = datos.get('foto_bomba') as File
      const fotoTanque1 = datos.get('foto_tanque1') as File
      const fotoTanque2 = datos.get('foto_tanque2') as File

      const [urlTicket, urlKm, urlBomba, urlTanque1, urlTanque2] = await Promise.all([
        subirFoto(fotoTicket, 'ticket'),
        subirFoto(fotoKm, 'km'),
        subirFoto(fotoBomba, 'bomba'),
        subirFoto(fotoTanque1, 'tanque1'),
        subirFoto(fotoTanque2, 'tanque2'),
      ])

      if (!urlTicket || !urlKm || !urlBomba || !urlTanque1) {
        throw new Error('Faltan fotos obligatorias por subir')
      }

      const datosFinales = new FormData()
      datosFinales.set('terminal_id', datos.get('terminal_id') as string)
      datosFinales.set('vehiculo_id', vehiculoId)
      datosFinales.set('operador_id', operadorId)
      datosFinales.set('kilometraje', datos.get('kilometraje') as string)
      datosFinales.set('folio_ticket', (datos.get('folio_ticket') as string) ?? '')
      datosFinales.set('litros_cargados', datos.get('litros_cargados') as string)
      datosFinales.set('precio_litro', datos.get('precio_litro') as string)
      datosFinales.set('metodo_pago', datos.get('metodo_pago') as string)
      datosFinales.set('observaciones', (datos.get('observaciones') as string) ?? '')
      datosFinales.set('foto_ticket_url', urlTicket)
      datosFinales.set('foto_kilometraje_url', urlKm)
      datosFinales.set('foto_bomba_url', urlBomba)
      datosFinales.set('foto_tanque1_url', urlTanque1)
      if (urlTanque2) datosFinales.set('foto_tanque2_url', urlTanque2)

      await crearCargaAction(datosFinales)
    } catch (err) {
      setSubiendo(false)
      setError(err instanceof Error ? err.message : 'No se pudo guardar la carga')
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <input type="hidden" name="terminal_id" value={terminalId} />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
          <BuscadorUnidad
            name="vehiculo_id"
            placeholder="Buscar unidad..."
            opciones={vehiculos.map((v) => ({ id: v.value, label: v.label }))}
            valorInicial={vehiculoIdPreseleccionado}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operador</label>
          <BuscadorUnidad
            name="operador_id"
            placeholder="Buscar operador..."
            opciones={operadores.map((o) => ({ id: o.value, label: o.label }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Kilometraje" name="kilometraje" type="number" required />
        <Campo label="Folio de ticket" name="folio_ticket" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Litros cargados" name="litros_cargados" type="number" step="0.01" required />
        <Campo label="Precio por litro" name="precio_litro" type="number" step="0.01" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Método de pago</label>
        <select name="metodo_pago" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="tarjeta_empresa">Tarjeta empresa</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="credito_proveedor">Crédito proveedor</option>
          <option value="vale">Vale</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Foto label="Foto del ticket" name="foto_ticket" required />
        <Foto label="Foto del kilometraje" name="foto_kilometraje" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Foto label="Foto de la bomba" name="foto_bomba" required />
        <Foto label="Foto del tanque 1" name="foto_tanque1" required />
      </div>
      <Foto label="Foto del tanque 2 (opcional)" name="foto_tanque2" />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
        <textarea name="observaciones" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={subiendo}
        className="w-full rounded-md bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 transition-colors"
      >
        {subiendo ? 'Subiendo fotos y guardando...' : 'Guardar carga'}
      </button>
    </form>
  )
}

function Campo({ label, name, type = 'text', required = false, step }: { label: string; name: string; type?: string; required?: boolean; step?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type={type} step={step} required={required} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
    </div>
  )
}

function Foto({ label, name, required = false }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type="file" accept="image/*" capture="environment" required={required} className="w-full text-sm" />
    </div>
  )
}