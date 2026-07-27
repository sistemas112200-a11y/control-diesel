'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { editarCargaAction } from '../actions'
import { BuscadorUnidad } from '@/components/ui/buscador-unidad'
import type { CargaCombustible } from '@/lib/supabase/types'

async function subirFotoSiHay(archivo: File | null, prefijo: string): Promise<string | undefined> {
  if (!archivo || archivo.size === 0) return undefined
  const supabase = createClient()
  const nombre = `${prefijo}-${Date.now()}-${archivo.name}`
  const { data, error } = await supabase.storage.from('cargas-foto').upload(nombre, archivo)
  if (error) throw new Error(`No se pudo subir la foto (${prefijo}): ${error.message}`)
  const { data: urlData } = supabase.storage.from('cargas-foto').getPublicUrl(data.path)
  return urlData.publicUrl
}

export function FormularioEditarCarga({
  carga,
  vehiculos,
  operadores,
}: {
  carga: CargaCombustible
  vehiculos: { value: string; label: string }[]
  operadores: { value: string; label: string }[]
}) {
  const [guardando, setGuardando] = useState(false)
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

    setGuardando(true)

    try {
      const nuevaFotoTicket = datos.get('foto_ticket') as File
      const nuevaFotoKm = datos.get('foto_kilometraje') as File
      const nuevaFotoBomba = datos.get('foto_bomba') as File
      const nuevaFotoTanque1 = datos.get('foto_tanque1') as File
      const nuevaFotoTanque2 = datos.get('foto_tanque2') as File

      const [urlTicket, urlKm, urlBomba, urlTanque1, urlTanque2] = await Promise.all([
        subirFotoSiHay(nuevaFotoTicket, 'ticket'),
        subirFotoSiHay(nuevaFotoKm, 'km'),
        subirFotoSiHay(nuevaFotoBomba, 'bomba'),
        subirFotoSiHay(nuevaFotoTanque1, 'tanque1'),
        subirFotoSiHay(nuevaFotoTanque2, 'tanque2'),
      ])

      const datosFinales = new FormData()
      datosFinales.set('vehiculo_id', vehiculoId)
      datosFinales.set('operador_id', operadorId)
      datosFinales.set('kilometraje', datos.get('kilometraje') as string)
      datosFinales.set('folio_ticket', (datos.get('folio_ticket') as string) ?? '')
      datosFinales.set('litros_cargados', datos.get('litros_cargados') as string)
      datosFinales.set('precio_litro', datos.get('precio_litro') as string)
      datosFinales.set('metodo_pago', datos.get('metodo_pago') as string)
      datosFinales.set('observaciones', (datos.get('observaciones') as string) ?? '')
      datosFinales.set('foto_ticket_url', urlTicket ?? carga.foto_ticket_url ?? '')
      datosFinales.set('foto_kilometraje_url', urlKm ?? carga.foto_kilometraje_url ?? '')
      datosFinales.set('foto_bomba_url', urlBomba ?? carga.foto_bomba_url ?? '')
      datosFinales.set('foto_tanque1_url', urlTanque1 ?? carga.foto_tanque1_url ?? '')
      datosFinales.set('foto_tanque2_url', urlTanque2 ?? carga.foto_tanque2_url ?? '')

      await editarCargaAction(carga.id, datosFinales)
    } catch (err) {
      setGuardando(false)
      setError(err instanceof Error ? err.message : 'No se pudo guardar los cambios')
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
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
            valorInicial={carga.vehiculo_id}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Operador</label>
          <BuscadorUnidad
            name="operador_id"
            placeholder="Buscar operador..."
            opciones={operadores.map((o) => ({ id: o.value, label: o.label }))}
            valorInicial={carga.operador_id}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Kilometraje" name="kilometraje" type="number" required defaultValue={String(carga.kilometraje)} />
        <Campo label="Folio de ticket" name="folio_ticket" defaultValue={carga.folio_ticket ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Litros cargados" name="litros_cargados" type="number" step="0.01" required defaultValue={String(carga.litros_cargados)} />
        <Campo label="Precio por litro" name="precio_litro" type="number" step="0.01" required defaultValue={String(carga.precio_litro)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Método de pago</label>
        <select name="metodo_pago" required defaultValue={carga.metodo_pago} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="tarjeta_empresa">Tarjeta empresa</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="credito_proveedor">Crédito proveedor</option>
          <option value="vale">Vale</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FotoEditable label="Foto del ticket" name="foto_ticket" urlActual={carga.foto_ticket_url} />
        <FotoEditable label="Foto del kilometraje" name="foto_kilometraje" urlActual={carga.foto_kilometraje_url} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FotoEditable label="Foto de la bomba" name="foto_bomba" urlActual={carga.foto_bomba_url} />
        <FotoEditable label="Foto del tanque 1" name="foto_tanque1" urlActual={carga.foto_tanque1_url} />
      </div>
      <FotoEditable label="Foto del tanque 2" name="foto_tanque2" urlActual={carga.foto_tanque2_url} />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
        <textarea name="observaciones" rows={2} defaultValue={carga.observaciones ?? ''} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-md bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 transition-colors"
      >
        {guardando ? 'Guardando cambios...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function Campo({ label, name, type = 'text', required = false, step, defaultValue }: { label: string; name: string; type?: string; required?: boolean; step?: string; defaultValue?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input id={name} name={name} type={type} step={step} required={required} defaultValue={defaultValue} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
    </div>
  )
}

function FotoEditable({ label, name, urlActual }: { label: string; name: string; urlActual: string | null }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {urlActual && (
        <a href={urlActual} target="_blank" rel="noopener noreferrer" className="block mb-2">
          <img src={urlActual} alt={label} className="w-full h-24 object-cover rounded-md border border-slate-200" />
        </a>
      )}
      <input id={name} name={name} type="file" accept="image/*" capture="environment" className="w-full text-sm" />
      <p className="text-xs text-slate-500 mt-1">Deja vacío para mantener la foto actual</p>
    </div>
  )
}