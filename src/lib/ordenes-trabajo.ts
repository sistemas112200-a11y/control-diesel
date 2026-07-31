import type { EstadoReporte, PrioridadOrden } from '@/lib/supabase/types'

export const ESTADO_LABEL: Record<EstadoReporte, string> = {
  abierta: 'Abierta',
  asignada: 'Asignada',
  en_proceso: 'En proceso',
  espera_refacciones: 'Espera de refacciones',
  completada: 'Completada',
}

export const ESTADO_COLOR: Record<EstadoReporte, string> = {
  abierta: 'bg-red-100 text-red-700',
  asignada: 'bg-blue-100 text-blue-700',
  en_proceso: 'bg-amber-100 text-amber-700',
  espera_refacciones: 'bg-purple-100 text-purple-700',
  completada: 'bg-green-100 text-green-700',
}

export const PRIORIDAD_LABEL: Record<PrioridadOrden, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const PRIORIDAD_COLOR: Record<PrioridadOrden, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-slate-100 text-slate-600',
}

export const COLUMNAS_ESTADO: EstadoReporte[] = ['abierta', 'asignada', 'en_proceso', 'espera_refacciones', 'completada']