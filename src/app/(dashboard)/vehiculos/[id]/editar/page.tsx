import Link from 'next/link'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { actualizarVehiculoAction } from './actions'

export default async function EditarVehiculoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const urlCarga = `${baseUrl}/cargas/nuevo?vehiculo_id=${vehiculo.id}`
  const qrDataUrl = await QRCode.toDataURL(urlCarga, { width: 300, margin: 1 })

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Editar vehículo</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-6">
        <img src={qrDataUrl} alt={`QR de la unidad ${vehiculo.numero_economico}`} className="w-32 h-32 shrink-0" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Código QR — {vehiculo.numero_economico}</p>
          <p className="text-xs text-slate-500">
            Al escanearlo se abre "Nueva carga" con esta unidad ya seleccionada.
          </p>
          <Link
            href={`/vehiculos/${vehiculo.id}/qr`}
            className="inline-block text-xs font-medium text-brand-dark hover:underline"
          >
            Ver en grande / Imprimir
          </Link>
        </div>
      </div>

      <form action={actualizarVehiculoAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="id" value={vehiculo.id} />
        <Campo label="Número económico" name="numero_economico" defaultValue={vehiculo.numero_economico} required />
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Placas" name="placas" defaultValue={vehiculo.placas ?? ''} />
          <Campo label="Año" name="anio" type="number" defaultValue={vehiculo.anio != null ? String(vehiculo.anio) : ''} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Marca" name="marca" defaultValue={vehiculo.marca ?? ''} />
          <Campo label="Modelo" name="modelo" defaultValue={vehiculo.modelo ?? ''} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Campo
            label="Capacidad de tanque (L)"
            name="capacidad_tanque1_litros"
            type="number"
            step="0.01"
            defaultValue={String(vehiculo.capacidad_tanque1_litros)}
            required
          />
          <Campo
            label="Rendimiento esperado (km/L)"
            name="rendimiento_esperado_km_l"
            type="number"
            step="0.01"
            defaultValue={String(vehiculo.rendimiento_esperado_km_l)}
            required
          />
        </div>
        <button type="submit" className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors">
          Guardar cambios
        </button>
      </form>
    </div>
  )
}

function Campo({
  label,
  name,
  type = 'text',
  required = false,
  step,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  step?: string
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  )
}