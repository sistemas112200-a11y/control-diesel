import { z } from 'zod'

export const cargaSchema = z.object({
  terminal_id: z.string().uuid(),
  vehiculo_id: z.string().uuid(),
  operador_id: z.string().uuid(),
  vale_id: z.string().uuid().optional(),
  proveedor_id: z.string().uuid().optional(),
  estacion_id: z.string().uuid().optional(),
  fecha_hora: z.string().datetime().optional(),
  kilometraje: z.number().positive('El kilometraje debe ser mayor a 0'),
  horometro: z.number().positive().optional(),
  litros_cargados: z.number().positive('Los litros deben ser mayor a 0'),
  precio_litro: z.number().positive('El precio por litro debe ser mayor a 0'),
  total_pagado: z.number().positive('El total pagado debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'tarjeta_empresa', 'transferencia', 'credito_proveedor', 'vale']),
  folio_ticket: z.string().optional(),
  foto_ticket_url: z.string().url().optional(),
  foto_kilometraje_url: z.string().url().optional(),
  foto_bomba_url: z.string().url().optional(),
  foto_tanque1_url: z.string().url().optional(),
  foto_tanque2_url: z.string().url().optional(),
  ubicacion_lat: z.number().optional(),
  ubicacion_lng: z.number().optional(),
  observaciones: z.string().optional(),
})

export type CargaInput = z.infer<typeof cargaSchema>