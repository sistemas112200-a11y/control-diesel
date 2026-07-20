import { z } from 'zod'

export const operadorSchema = z.object({
  empresa_id: z.string().uuid(),
  nombre_completo: z.string().min(1, 'El nombre es obligatorio'),
  licencia_numero: z.string().optional(),
  licencia_vigencia: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  fecha_ingreso: z.string().optional(),
})

export type OperadorInput = z.infer<typeof operadorSchema>