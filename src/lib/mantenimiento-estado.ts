import type { Mantenimiento } from '@/lib/supabase/types'

type RegistroMantenimiento = Pick<
  Mantenimiento,
  'kilometraje' | 'fecha' | 'intervalo_km' | 'intervalo_dias' | 'aviso_km' | 'aviso_dias'
>

function diasTranscurridos(fecha: string): number {
  return Math.floor((Date.now() - new Date(fecha + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
}

export function kmRestantes(registro: RegistroMantenimiento, kmActual: number): number | null {
  if (registro.intervalo_km == null) return null
  return registro.kilometraje + registro.intervalo_km - kmActual
}

export function diasRestantes(registro: RegistroMantenimiento): number | null {
  if (registro.intervalo_dias == null) return null
  return registro.intervalo_dias - diasTranscurridos(registro.fecha)
}

export function estaVencido(registro: RegistroMantenimiento, kmActual: number): boolean {
  const km = kmRestantes(registro, kmActual)
  const dias = diasRestantes(registro)
  const kmVencido = km != null && km <= 0
  const diasVencido = dias != null && dias <= 0
  return kmVencido || diasVencido
}

export function estaProximo(registro: RegistroMantenimiento, kmActual: number): boolean {
  if (estaVencido(registro, kmActual)) return false

  const km = kmRestantes(registro, kmActual)
  const dias = diasRestantes(registro)

  const kmProximo = registro.aviso_km != null && km != null && km <= registro.aviso_km
  const diasProximo = registro.aviso_dias != null && dias != null && dias <= registro.aviso_dias

  return kmProximo || diasProximo
}