import type { SupabaseClient } from '@supabase/supabase-js'
import type { CargaCombustible, Vehiculo } from '@/lib/supabase/types'
import { reglasDeCarga } from '@/domain/rules/alerta-rules'
import { crearAlerta } from '@/repositories/alerta.repository'

export async function evaluarCarga(supabase: SupabaseClient, carga: CargaCombustible, vehiculo: Vehiculo) {
  const contexto = { supabase, carga, vehiculo }

  const resultados = await Promise.all(reglasDeCarga.map((regla) => regla.evaluar(contexto)))
  const candidatas = resultados.filter((r): r is NonNullable<typeof r> => r !== null)

  for (const alerta of candidatas) {
    await crearAlerta(supabase, {
      terminal_id: carga.terminal_id,
      tipo: alerta.tipo,
      severidad: alerta.severidad,
      descripcion: alerta.descripcion,
      vehiculo_id: carga.vehiculo_id,
      operador_id: carga.operador_id,
      carga_id: carga.id,
    })
  }

  return candidatas
}