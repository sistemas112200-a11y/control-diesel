import Link from 'next/link'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { litrosAGalones, kmLaMpg, ETIQUETA_VOLUMEN, ETIQUETA_RENDIMIENTO } from '@/lib/unidades'
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
  const usuario = await getUsuarioActual()
  const empresa = usuario ? await getEmpresaById(supabase, usuario.empresaId) : null
  const unidad = empresa?.unidad_medida ?? 'metrico'

  const capacidadMostrada = unidad === 'imperial'
    ? litrosAGalones(vehiculo.capacidad_tanque1_litros)
    : vehiculo.capacidad_tanque1_litros
  const rendimientoMostrado = unidad === 'imperial'
    ? kmLaMpg(vehiculo.rendimiento_esperado_km_l)
    : vehiculo.rendimiento_esperado_km_l

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const urlUnidad = `${baseUrl}/unidad/${vehiculo.id}`
  const qrDataUrl = await QRCode.toDataURL(urlUnidad, { width: 300, margin: 1 })

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
            Al escanearlo se abre un menú con las opciones para esta unidad (nueva carga, reportar problema, ver mantenimientos).
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
            label={`Capacidad de tanque (${ETIQUETA_VOLUMEN[unidad]})`}
            name="capacidad_tanque1_litros"
            type="number"
            step="0.01"
            defaultValue={capacidadMostrada.toFixed(2)}
            required
          />
          <Campo
            label={`Rendimiento esperado (${ETIQUETA_RENDIMIENTO[unidad]})`}
            name="rendimiento_esperado_km_l"
            type="number"
            step="0.01"
            defaultValue={rendimientoMostrado.toFixed(2)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="numero_llantas" className="block text-sm font-medium text-slate-700 mb-1">
              ¿Cuántas posiciones tiene la unidad?
            </label>
            <select
              id="numero_llantas"
              name="numero_llantas"
              defaultValue={String(vehiculo.numero_llantas)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="tiene_eje_delantero"
              name="tiene_eje_delantero"
              type="checkbox"
              defaultChecked={vehiculo.tiene_eje_delantero}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <label htmlFor="tiene_eje_delantero" className="text-sm font-medium text-slate-700">
              Tiene eje delantero (como un tracto)
            </label>
          </div>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Desmarca esta casilla para dollys o remolques, que no tienen llanta delantera sencilla.
        </p>

        <Campo
          label="Intervalo de mantenimiento (km) — opcional"
          name="intervalo_mantenimiento_km"
          type="number"
          defaultValue={vehiculo.intervalo_mantenimiento_km != null ? String(vehiculo.intervalo_mantenimiento_km) : ''}
        />
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