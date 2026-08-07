import { z } from 'zod'

export const llantaSchema = z.object({
  vehiculo_id: z.string().uuid().optional(),
  posicion: z
    .enum([
      'delantera_izquierda',
      'delantera_derecha',
      'trasera_izquierda_interna',
      'trasera_izquierda_externa',
      'trasera_derecha_interna',
      'trasera_derecha_externa',
      'refaccion',
      'otra',
    ])
    .optional(),
  numero_serie: z.string().optional(),
  marca: z.string().min(1, 'Falta la marca'),
  modelo: z.string().optional(),
  medida: z.string().optional(),
  proveedor_id: z.string().uuid().optional(),
  costo: z.coerce.number().positive().optional(),
  fecha_compra: z.string().optional(),
  fecha_instalacion: z.string().optional(),
  km_instalacion: z.coerce.number().min(0).optional(),
  profundidad_original_mm: z.coerce.number().positive().default(18),
  profundidad_minima_mm: z.coerce.number().positive().default(3),
  presion_recomendada_psi: z.coerce.number().positive().optional(),
})

export type LlantaInput = z.infer<typeof llantaSchema>