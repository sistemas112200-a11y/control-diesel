import { z } from 'zod'

export const vehiculoSchema = z.object({
  empresa_id: z.string().uuid(),
  terminal_id: z.string().uuid(),
  numero_economico: z.string().min(1, 'El número económico es obligatorio'),
  placas: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  tipo_combustible: z.string().default('diesel'),
  capacidad_tanque1_litros: z.number().positive('La capacidad debe ser mayor a 0'),
  capacidad_tanque2_litros: z.number().positive().optional(),
  rendimiento_esperado_km_l: z.number().positive('El rendimiento esperado debe ser mayor a 0'),
  estado: z.enum(['activo', 'taller', 'baja']).default('activo'),
  foto_url: z.string().url().optional(),
  numero_llantas: z.number().int().positive('El número de llantas debe ser mayor a 0').default(6),
  tiene_eje_delantero: z.boolean().default(true),
})

export type VehiculoInput = z.infer<typeof vehiculoSchema>