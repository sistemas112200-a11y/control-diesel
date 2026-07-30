import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { getMantenimientosPorVehiculo } from '@/repositories/mantenimiento.repository'
import { estaVencido } from '@/lib/mantenimiento-estado'
import { getUsuarioActual } from '@/lib/auth/session'
import { puede } from '@/lib/auth/permissions'
import { getModulosVisibles } from '@/repositories/permiso.repository'

export default async function UnidadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const vehiculo = await getVehiculoById(supabase, id)
  const usuario = await getUsuarioActual()

  if (vehiculo.estado === 'taller') {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <div className="text-6xl">🔧</div>
        <h1 className="text-2xl font-bold text-amber-600">UNIDAD EN TALLER</h1>
        <p className="text-lg text-slate-700">
          La unidad <span className="font-semibold">{vehiculo.numero_economico}</span> está en mantenimiento.
        </p>
        <p className="text-slate-600">No disponible para viaje en este momento.</p>
      </div>
    )
  }

  if (vehiculo.estado === 'baja') {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-red-600">UNIDAD FUERA DE SERVICIO</h1>
        <p className="text-lg text-slate-700">
          La unidad <span className="font-semibold">{vehiculo.numero_economico}</span> no está activa en este momento.
        </p>
        <p className="text-slate-600">Contacta al personal a cargo antes de continuar.</p>
      </div>
    )
  }

  const mantenimientos = await getMantenimientosPorVehiculo(supabase, id)
  const vencidos = mantenimientos.filter((m) => estaVencido(m, vehiculo.km_actual))

  const puedeReportar = usuario ? puede(usuario.rol, 'reportes_unidad', 'crear') : false
  const puedeGenerarPase = usuario ? puede(usuario.rol, 'pases_salida', 'crear') : false
  const modulosVisibles = usuario ? await getModulosVisibles(supabase, usuario.rol, usuario.empresaId) : new Set()
  const puedeVerMantenimientos = modulosVisibles.has('mantenimientos')
  const esGuardia = usuario?.rol === 'guardia'

  return (
    <div className="max-w-md mx-auto space-y-6 text-center py-8">
      <div>
        <p className="text-sm text-slate-500">Unidad</p>
        <h1 className="text-3xl font-bold text-slate-900">{vehiculo.numero_economico}</h1>
      </div>

      {esGuardia && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 font-medium">
          ✅ Unidad disponible para viaje
        </div>
      )}

      {vencidos.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 text-left">
          <p className="font-medium mb-1">⚠️ Mantenimiento vencido</p>
          <ul className="list-disc list-inside space-y-0.5">
            {vencidos.map((m) => (
              <li key={m.id}>{m.descripcion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <Link
          href={`/cargas/nuevo?vehiculo_id=${vehiculo.id}`}
          className="block w-full rounded-md bg-brand hover:bg-brand-dark text-white text-sm font-medium py-3 transition-colors"
        >
          Nueva carga de diésel
        </Link>

        {puedeReportar && (
          <Link
            href={`/unidad/${vehiculo.id}/reporte`}
            className="block w-full rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 transition-colors"
          >
            Reportar un problema
          </Link>
        )}

        {puedeVerMantenimientos && (
          <Link
            href={`/unidad/${vehiculo.id}/mantenimientos`}
            className="block w-full rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 transition-colors"
          >
            Ver mantenimientos
          </Link>
        )}

        {puedeGenerarPase && (
          <Link
            href={`/unidad/${vehiculo.id}/pase-salida`}
            className="block w-full rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium py-3 transition-colors"
          >
            Generar pase de salida
          </Link>
        )}
      </div>
    </div>
  )
}