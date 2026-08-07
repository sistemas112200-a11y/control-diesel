import { z } from 'zod'

export const medicionLlantaSchema = z.object({
  llanta_id: z.string().uuid(),
  fecha_hora: z.string().optional(),
  km_vehiculo: z.coerce.number().min(0, 'Falta el kilometraje'),
  profundidad_interior_mm: z.coerce.number().min(0, 'Falta la profundidad interior'),
  profundidad_centro_mm: z.coerce.number().min(0, 'Falta la profundidad del centro'),
  profundidad_exterior_mm: z.coerce.number().min(0, 'Falta la profundidad exterior'),
  presion_psi: z.coerce.number().positive('Falta la presión'),
  foto_url: z.string().url().optional(),
  observaciones: z.string().optional(),
})

export type MedicionLlantaInput = z.infer<typeof medicionLlantaSchema>