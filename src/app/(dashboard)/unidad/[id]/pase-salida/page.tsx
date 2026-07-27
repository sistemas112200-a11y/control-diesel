import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { FirmaPad } from '@/components/ui/firma-pad'
import { crearPaseSalidaAction } from './actions'

export default async function PaseSalidaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const usuario = await getUsuarioActual()
  if (!usuario || !puede(usuario.rol, 'pases_salida', 'crear')) {
    redirect(`/unidad/${id}`)
  }

  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-500">Pase de salida</p>
        <h1 className="text-2xl font-bold text-slate-900">{vehiculo.numero_economico}</h1>
      </div>

      <form action={crearPaseSalidaAction} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <input type="hidden" name="vehiculo_id" value={vehiculo.id} />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Destino (opcional)</label>
          <input name="destino" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <p className="text-sm font-medium text-slate-700 pt-2 border-t border-slate-100">
          La unidad esta disponible para salir a ruta
        </p>

        <FirmaBloque numero={1} />
        <FirmaBloque numero={2} />
        <FirmaBloque numero={3} />

        <button
          type="submit"
          className="w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2 transition-colors"
        >
          Generar pase de salida
        </button>
      </form>
    </div>
  )
}

function FirmaBloque({ numero }: { numero: number }) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <label className="block text-sm font-medium text-slate-700">Firma {numero} (opcional)</label>
      <input
        name={"firma" + numero + "_nombre"}
        placeholder="Nombre de quien firma"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <FirmaPad name={"firma" + numero + "_url"} />
    </div>
  )
}