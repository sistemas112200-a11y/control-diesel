import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEnlacePorToken } from '@/repositories/enlace-publico-llanta.repository'
import { getLlantas, type LlantaConVehiculo } from '@/repositories/llanta.repository'
import { FirmaOperadorForm } from './firma-operador-form'
import { BotonImprimir } from './boton-imprimir'

const ETIQUETAS_POSICION: Record<string, string> = {
  delantera_izquierda: 'Delantera izquierda',
  delantera_derecha: 'Delantera derecha',
  trasera_izquierda_interna: 'Trasera izquierda interna',
  trasera_izquierda_externa: 'Trasera izquierda externa',
  trasera_derecha_interna: 'Trasera derecha interna',
  trasera_derecha_externa: 'Trasera derecha externa',
  refaccion: 'Refacción',
  otra: 'Otra',
}

function formatoFecha(fecha: string | null) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Chihuahua',
  })
}

function estadoLlanta(llanta: Pick<LlantaConVehiculo, 'profundidad_actual_mm' | 'profundidad_minima_mm' | 'presion_actual_psi' | 'presion_recomendada_psi'>) {
  if (llanta.profundidad_actual_mm == null) {
    return { texto: 'Sin medición', color: '#888888' }
  }
  if (llanta.profundidad_actual_mm <= llanta.profundidad_minima_mm) {
    return { texto: 'Profundidad baja', color: '#a32d2d' }
  }
  if (
    llanta.presion_actual_psi != null &&
    llanta.presion_recomendada_psi != null &&
    Math.abs(llanta.presion_actual_psi - llanta.presion_recomendada_psi) / llanta.presion_recomendada_psi > 0.15
  ) {
    return { texto: 'Presión fuera de rango', color: '#854f0b' }
  }
  return { texto: 'Bien', color: '#3b6d11' }
}

const celdaEncabezado: CSSProperties = { textAlign: 'left', padding: '6px 8px', border: '1px solid #ddd' }
const celda: CSSProperties = { padding: '6px 8px', border: '1px solid #ddd' }

interface DatosReporte {
  vehiculo: { numero_economico: string; placas: string | null; km_actual: number | null } | null
  llantas: LlantaConVehiculo[]
}

export default async function ReporteLlantasPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  let enlace
  try {
    enlace = await getEnlacePorToken(supabase, token)
  } catch {
    notFound()
  }

  const yaFirmado = Boolean(enlace.firma_url)

  let datos: DatosReporte
  if (yaFirmado && enlace.datos_snapshot) {
    // Reporte ya firmado: se muestra exactamente como estaba cuando se firmó, no los datos actuales.
    datos = enlace.datos_snapshot as DatosReporte
  } else {
    const llantas = await getLlantas(supabase, { vehiculoId: enlace.vehiculo_id })
    const { data: vehiculo } = await supabase
      .from('vehiculos')
      .select('numero_economico, placas, km_actual')
      .eq('id', enlace.vehiculo_id)
      .single()
    datos = { vehiculo, llantas }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px', fontFamily: 'sans-serif', color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #185fa5', paddingBottom: 14, marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 17, fontWeight: 500, margin: 0, color: '#0c447c' }}>FlotaTotal</p>
          <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0' }}>Reporte de llantas por unidad</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            {yaFirmado ? `Firmado el: ${formatoFecha(enlace.firmado_en)}` : `Generado: ${formatoFecha(new Date().toISOString())}`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18, fontSize: 12 }}>
        <div>
          <span style={{ color: '#888' }}>Unidad</span>
          <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: 14 }}>{datos.vehiculo?.numero_economico ?? '—'}</p>
        </div>
        <div>
          <span style={{ color: '#888' }}>Placas</span>
          <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: 14 }}>{datos.vehiculo?.placas ?? '—'}</p>
        </div>
        <div>
          <span style={{ color: '#888' }}>Km {yaFirmado ? 'al firmar' : 'actual'}</span>
          <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: 14 }}>{datos.vehiculo?.km_actual?.toLocaleString('es-MX') ?? '—'}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f1ef' }}>
            <th style={celdaEncabezado}>Posición</th>
            <th style={celdaEncabezado}>Marca / medida</th>
            <th style={{ ...celdaEncabezado, textAlign: 'right' }}>Profundidad</th>
            <th style={{ ...celdaEncabezado, textAlign: 'right' }}>Presión</th>
            <th style={celdaEncabezado}>Estado</th>
            <th style={celdaEncabezado}>Última medición</th>
          </tr>
        </thead>
        <tbody>
          {datos.llantas.map((llanta) => {
            const estado = estadoLlanta(llanta)
            return (
              <tr key={llanta.id}>
                <td style={celda}>{llanta.posicion ? ETIQUETAS_POSICION[llanta.posicion] ?? llanta.posicion : '—'}</td>
                <td style={celda}>{llanta.marca} {llanta.medida ?? ''}</td>
                <td style={{ ...celda, textAlign: 'right' }}>{llanta.profundidad_actual_mm != null ? `${llanta.profundidad_actual_mm} mm` : '—'}</td>
                <td style={{ ...celda, textAlign: 'right' }}>{llanta.presion_actual_psi != null ? `${llanta.presion_actual_psi} psi` : '—'}</td>
                <td style={{ ...celda, color: estado.color }}>{estado.texto}</td>
                <td style={celda}>{formatoFecha(llanta.fecha_ultima_medicion)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {enlace.firma_url ? (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>Firmado por {enlace.firmado_por} el {formatoFecha(enlace.firmado_en)}</p>
          <img src={enlace.firma_url} alt="Firma del operador" style={{ height: 80 }} />
        </div>
      ) : (
        <div className="print:hidden">
          <FirmaOperadorForm token={token} />
        </div>
      )}

      <div className="print:hidden" style={{ marginTop: 24 }}>
        <BotonImprimir />
      </div>

      <p style={{ fontSize: 10, color: '#999', textAlign: 'center', margin: '20px 0 0', borderTop: '1px solid #eee', paddingTop: 10 }}>
        Documento generado por FlotaTotal
      </p>
    </div>
  )
}