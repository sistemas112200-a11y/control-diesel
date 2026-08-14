import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCargaById } from '@/repositories/carga.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { getEmpresaById } from '@/repositories/empresa.repository'
import { puede, puedeVerDetalleCargas } from '@/lib/auth/permissions'
import { BotonEliminarCarga } from './boton-eliminar'
import { formatoFechaHora } from '@/lib/fecha'
import { formatoDistancia, formatoVolumen, formatoRendimiento, formatoCostoPorDistancia, formatoPrecioVolumen } from '@/lib/unidades'

export default async function DetalleCargaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const usuarioActual = await getUsuarioActual()
  if (!usuarioActual || !puedeVerDetalleCargas(usuarioActual.rol)) {
    redirect('/cargas')
  }

  const supabase = await createClient()
  const empresa = await getEmpresaById(supabase, usuarioActual.empresaId)
  const unidad = empresa.unidad_medida

  let carga
  try {
    carga = await getCargaById(supabase, id)
  } catch {
    notFound()
  }

  const { data: vehiculo } = await supabase.from('vehiculos').select('numero_economico').eq('id', carga.vehiculo_id).single()
  const { data: operador } = await supabase.from('operadores').select('nombre_completo').eq('id', carga.operador_id).single()
  const { data: capturadaPor } = await supabase.from('usuarios').select('nombre_completo').eq('id', carga.created_by).single()

  const fotos = [
    { label: 'Ticket', url: carga.foto_ticket_url },
    { label: 'Kilometraje', url: carga.foto_kilometraje_url },
    { label: 'Bomba', url: carga.foto_bomba_url },
    { label: 'Tanque 1', url: carga.foto_tanque1_url },
    { label: 'Tanque 2', url: carga.foto_tanque2_url },
  ].filter((f) => f.url)

  const puedeEditar = puede(usuarioActual.rol, 'cargas', 'editar')
  const puedeEliminar = puede(usuarioActual.rol, 'cargas', 'eliminar')

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Detalle de carga</h1>
        {(puedeEditar || puedeEliminar) && (
          <div className="flex gap-3">
            {puedeEditar && (
              <Link
                href={`/cargas/${id}/editar`}
                className="rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium px-4 py-2 transition-colors"
              >
                Editar
              </Link>
            )}
            {puedeEliminar && <BotonEliminarCarga id={id} />}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 grid grid-cols-2 gap-4 text-sm">
        <Dato label="Unidad" valor={vehiculo?.numero_economico ?? '—'} />
        <Dato label="Operador" valor={operador?.nombre_completo ?? '—'} />
        <Dato label="Fecha" valor={formatoFechaHora(carga.fecha_hora)} />
        <Dato label={unidad === 'imperial' ? 'Millaje' : 'Kilometraje'} valor={formatoDistancia(carga.kilometraje, unidad, 0)} />
        <Dato label={unidad === 'imperial' ? 'Galones cargados' : 'Litros cargados'} valor={formatoVolumen(carga.litros_cargados, unidad, 2)} />
        <Dato label={unidad === 'imperial' ? 'Precio por galón' : 'Precio por litro'} valor={formatoPrecioVolumen(carga.precio_litro, unidad)} />
        <Dato label="Total pagado" valor={`$${carga.total_pagado.toFixed(2)}`} />
        <Dato label="Método de pago" valor={carga.metodo_pago} />
        <Dato label="Folio de ticket" valor={carga.folio_ticket ?? '—'} />
        <Dato label={unidad === 'imperial' ? 'Millas recorridas' : 'Km recorridos'} valor={carga.km_recorridos != null ? formatoDistancia(carga.km_recorridos, unidad, 0) : '—'} />
        <Dato label="Rendimiento" valor={carga.rendimiento_km_l != null ? formatoRendimiento(carga.rendimiento_km_l, unidad) : '—'} />
        <Dato label={unidad === 'imperial' ? 'Costo por milla' : 'Costo por km'} valor={carga.costo_por_km != null ? formatoCostoPorDistancia(carga.costo_por_km, unidad) : '—'} />
        <Dato label="Capturado por" valor={capturadaPor?.nombre_completo ?? '—'} />
        {carga.observaciones && (
          <div className="col-span-2">
            <Dato label="Observaciones" valor={carga.observaciones} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-medium text-slate-700 mb-4">Evidencia fotográfica</h2>
        <div className="grid grid-cols-3 gap-4">
          {fotos.map((f) => (
            <a key={f.label} href={f.url!} target="_blank" rel="noopener noreferrer" className="block">
              <img src={f.url!} alt={f.label} className="w-full h-32 object-cover rounded-md border border-slate-200" />
              <p className="text-xs text-slate-500 mt-1 text-center">{f.label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-900 font-medium">{valor}</p>
    </div>
  )
}