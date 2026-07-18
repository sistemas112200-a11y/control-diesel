import type { SupabaseClient } from '@supabase/supabase-js'
import type { TipoAlerta, SeveridadAlerta } from '@/lib/supabase/types'

export async function crearAlerta(supabase: SupabaseClient, alerta: {
  terminal_id: string
  tipo: TipoAlerta
  severidad: SeveridadAlerta
  descripcion: string
  vehiculo_id?: string
  operador_id?: string
  carga_id?: string
}) {
  const { error } = await supabase.from('alertas').insert(alerta)
  if (error) throw error
}

export async function existeCargaDuplicada(
  supabase: SupabaseClient,
  vehiculoId: string,
  kilometraje: number,
  fechaHora: string,
  excluirCargaId: string
) {
  const ventana = new Date(fechaHora)
  const desde = new Date(ventana.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const hasta = new Date(ventana.getTime() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('cargas_combustible')
    .select('id')
    .eq('vehiculo_id', vehiculoId)
    .eq('kilometraje', kilometraje)
    .neq('id', excluirCargaId)
    .gte('fecha_hora', desde)
    .lte('fecha_hora', hasta)
    .is('deleted_at', null)
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function existeTicketRepetido(supabase: SupabaseClient, folioTicket: string, excluirCargaId: string) {
  if (!folioTicket) return false

  const { data, error } = await supabase
    .from('cargas_combustible')
    .select('id')
    .eq('folio_ticket', folioTicket)
    .neq('id', excluirCargaId)
    .is('deleted_at', null)
    .limit(1)

  if (error) throw error
  return (data?.length ?? 0) > 0
}