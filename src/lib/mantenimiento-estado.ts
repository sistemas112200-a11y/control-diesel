import type { Mantenimiento } from '@/lib/supabase/types'

type RegistroMantenimiento = Pick<Mantenimiento, 'kilometraje' | 'fecha' | 'intervalo_km' | 'intervalo_dias'>

export function estaVencido(registro: RegistroMantenimiento, kmActual: number): boolean {
  const kmVencido = registro.intervalo_km != null && (kmActual - registro.kilometraje) >= registro.intervalo_km

  const diasTranscurridos = Math.floor(
    (Date.now() - new Date(registro.fecha + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)
  )
  const diasVencido = registro.intervalo_dias != null && diasTranscurridos >= registro.intervalo_dias

  return kmVencido || diasVencido
}