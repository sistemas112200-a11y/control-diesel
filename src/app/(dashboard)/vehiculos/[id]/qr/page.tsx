import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { BotonImprimir } from '@/components/vehiculos/boton-imprimir'

export default async function QRVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const url = `${baseUrl}/cargas/nuevo?vehiculo_id=${vehiculo.id}`
  const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1 })

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div className="print:hidden">
        <h1 className="text-lg font-semibold text-slate-900">Código QR — {vehiculo.numero_economico}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Imprime y pega este código en la unidad. Al escanearlo desde el celular, se abre el formulario de carga con la unidad ya seleccionada.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center gap-4">
        <img src={qrDataUrl} alt={`QR de la unidad ${vehiculo.numero_economico}`} className="w-64 h-64" />
        <p className="text-xl font-bold text-slate-900">{vehiculo.numero_economico}</p>
      </div>

      <BotonImprimir />
    </div>
  )
}