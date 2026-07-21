import type { SupabaseClient } from '@supabase/supabase-js'
import type { CargaCombustible, Vehiculo, TipoAlerta, SeveridadAlerta } from '@/lib/supabase/types'
import { existeCargaDuplicada, existeTicketRepetido } from '@/repositories/alerta.repository'

export interface ContextoEvaluacion {
  supabase: SupabaseClient
  carga: CargaCombustible
  vehiculo: Vehiculo
}

export interface AlertaCandidata {
  tipo: TipoAlerta
  severidad: SeveridadAlerta
  descripcion: string
}

export interface ReglaAlerta {
  evaluar(ctx: ContextoEvaluacion): Promise<AlertaCandidata | null>
}

const TOLERANCIA_RENDIMIENTO = 0.2 // 20% por debajo de lo esperado

export const reglaRendimientoBajo: ReglaAlerta = {
  async evaluar({ carga, vehiculo }) {
    if (carga.rendimiento_km_l == null) return null
    const minimoEsperado = vehiculo.rendimiento_esperado_km_l * (1 - TOLERANCIA_RENDIMIENTO)
    if (carga.rendimiento_km_l < minimoEsperado) {
      return {
        tipo: 'rendimiento_bajo',
        severidad: carga.rendimiento_km_l < minimoEsperado * 0.7 ? 'critica' : 'advertencia',
        descripcion: `Rendimiento de ${carga.rendimiento_km_l.toFixed(2)} km/L, esperado ${vehiculo.rendimiento_esperado_km_l} km/L`,
      }
    }
    return null
  },
}

export const reglaLitrosFueraRango: ReglaAlerta = {
  async evaluar({ carga, vehiculo }) {
    const capacidadTotal = vehiculo.capacidad_tanque1_litros + (vehiculo.capacidad_tanque2_litros ?? 0)
    if (carga.litros_cargados > capacidadTotal * 1.05) {
      return {
        tipo: 'litros_fuera_rango',
        severidad: 'critica',
        descripcion: `Se cargaron ${carga.litros_cargados} L, mayor a la capacidad del tanque (${capacidadTotal} L)`,
      }
    }
    return null
  },
}

export const reglaCargaDuplicada: ReglaAlerta = {
  async evaluar({ supabase, carga }) {
    const duplicada = await existeCargaDuplicada(supabase, carga.vehiculo_id, carga.kilometraje, carga.fecha_hora, carga.id)
    if (duplicada) {
      return {
        tipo: 'carga_duplicada',
        severidad: 'critica',
        descripcion: `Ya existe otra carga con el mismo kilometraje (${carga.kilometraje}) en menos de 24 horas`,
      }
    }
    return null
  },
}

export const reglaTicketRepetido: ReglaAlerta = {
  async evaluar({ supabase, carga }) {
    if (!carga.folio_ticket) return null
    const repetido = await existeTicketRepetido(supabase, carga.folio_ticket, carga.id)
    if (repetido) {
      return {
        tipo: 'ticket_repetido',
        severidad: 'critica',
        descripcion: `El folio de ticket "${carga.folio_ticket}" ya fue usado en otra carga`,
      }
    }
    return null
  },
}

export const reglaMantenimientoVencido: ReglaAlerta = {
  async evaluar({ supabase, carga, vehiculo }) {
    if (!vehiculo.intervalo_mantenimiento_km) return null

    const { data: ultimoMantenimiento } = await supabase
      .from('mantenimientos')
      .select('kilometraje')
      .eq('vehiculo_id', vehiculo.id)
      .is('deleted_at', null)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!ultimoMantenimiento) return null

    const kmDesdeUltimoServicio = carga.kilometraje - ultimoMantenimiento.kilometraje
    if (kmDesdeUltimoServicio < vehiculo.intervalo_mantenimiento_km) return null

    const { data: alertaExistente } = await supabase
      .from('alertas')
      .select('id')
      .eq('vehiculo_id', vehiculo.id)
      .eq('tipo', 'mantenimiento_vencido')
      .eq('estado', 'nueva')
      .limit(1)
      .maybeSingle()

    if (alertaExistente) return null

    return {
      tipo: 'mantenimiento_vencido',
      severidad: 'advertencia',
      descripcion: `La unidad lleva ${kmDesdeUltimoServicio.toFixed(0)} km desde el último mantenimiento (cada ${vehiculo.intervalo_mantenimiento_km} km)`,
    }
  },
}

export const reglasDeCarga: ReglaAlerta[] = [
  reglaRendimientoBajo,
  reglaLitrosFueraRango,
  reglaCargaDuplicada,
  reglaTicketRepetido,
  reglaMantenimientoVencido,
]