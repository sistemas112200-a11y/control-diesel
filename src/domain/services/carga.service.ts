import type { SupabaseClient } from '@supabase/supabase-js'
import { cargaSchema, type CargaInput } from '@/lib/validation/carga.schema'
import { crearCarga } from '@/repositories/carga.repository'
import { getVehiculoById } from '@/repositories/vehiculo.repository'
import { evaluarCarga } from '@/domain/services/alerta-engine'

export async function registrarCarga(supabase: SupabaseClient, input: CargaInput, usuarioId: string) {
  const datosValidados = cargaSchema.parse(input)

  if (datosValidados.vale_id) {
    const { data: vale, error } = await supabase
      .from('vales_combustible')
      .select('estado')
      .eq('id', datosValidados.vale_id)
      .single()

    if (error) throw error
    if (vale.estado !== 'autorizado') {
      throw new Error('El vale indicado no está autorizado o ya fue usado')
    }
  }

  const carga = await crearCarga(supabase, { ...datosValidados, created_by: usuarioId })

  if (datosValidados.vale_id) {
    await supabase.from('vales_combustible').update({ estado: 'usado' }).eq('id', datosValidados.vale_id)
  }

  const vehiculo = await getVehiculoById(supabase, carga.vehiculo_id)
  const alertasGeneradas = await evaluarCarga(supabase, carga, vehiculo)

  return { carga, alertasGeneradas }
}